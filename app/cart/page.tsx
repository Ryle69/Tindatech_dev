"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CartItem {
    id: number
    product_id: number
    product_name: string
    product_price: number
    product_image: string
    quantity: number
    size?: string
    color?: string
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchCart = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login?returnUrl=/cart")
                return
            }

            try {
                const { data, error } = await supabase
                    .from("Carts")
                    .select(`
                        CartItems (
                            id,
                            quantity,
                            size,
                            color,
                            Products (
                                id,
                                name,
                                price,
                                image
                            )
                        )
                    `)
                    .eq("user_id", user.id)
                    .single()

                if (error) throw error

                const items = data?.CartItems.map((item: any) => ({
                    id: item.id,
                    product_id: item.Products.id,
                    product_name: item.Products.name,
                    product_price: item.Products.price,
                    product_image: item.Products.image,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })) || []

                setCartItems(items)
            } catch (error) {
                console.error("Error fetching cart:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCart()
    }, [router])

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return

        try {
            const { error } = await supabase
                .from("CartItems")
                .update({ quantity: newQuantity })
                .eq("id", itemId)

            if (error) throw error

            setCartItems(cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ))
        } catch (error) {
            console.error("Error updating quantity:", error)
        }
    }

    const removeItem = async (itemId: number) => {
        try {
            const { error } = await supabase
                .from("CartItems")
                .delete()
                .eq("id", itemId)

            if (error) throw error

            setCartItems(cartItems.filter(item => item.id !== itemId))
        } catch (error) {
            console.error("Error removing item:", error)
        }
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product_price * item.quantity), 0
    )

    if (loading) {
        return <div className="container px-4 py-8">Loading cart...</div>
    }

    return (
        <div className="container px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                    <Link href="/storefront">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cartItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-4">
                                            <img
                                                src={item.product_image || "/placeholder.svg"}
                                                alt={item.product_name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>${item.product_price}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span>{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>${(item.product_price * item.quantity).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg h-fit">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                <span>Total</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full">Proceed to Checkout</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
