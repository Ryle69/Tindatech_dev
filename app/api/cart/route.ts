// app/api/cart/route.ts
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

    try {
        // Get user session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get or create cart for user
        const { data: cart, error: cartError } = await supabase
            .from("Carts")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle()

        if (cartError) throw cartError

        let cartId = cart?.id

        // Create cart if it doesn't exist
        if (!cartId) {
            const { data: newCart, error: newCartError } = await supabase
                .from("Carts")
                .insert({ user_id: user.id })
                .select()
                .single()

            if (newCartError) throw newCartError
            cartId = newCart.id
        }

        // Parse request body
        const { productId, quantity, size, color } = await request.json()

        // Add item to cart
        const { data: cartItem, error: upsertError } = await supabase
            .from("CartItems")
            .upsert({
                cart_id: cartId,
                product_id: productId,
                quantity,
                size,
                color
            }, {
                onConflict: 'cart_id,product_id,size,color',
                ignoreDuplicates: false
            })
            .select()
            .single()

        if (upsertError) throw upsertError

        return NextResponse.json(cartItem)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update cart" },
            { status: 500 }
        )
    }
}