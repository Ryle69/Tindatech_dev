'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AddToCartButton({ productId, quantity = 1 }: { productId: string, quantity?: number }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAddToCart = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      toast.error('Please sign in first')
      return
    }

    const { data: existingCart, error: cartError } = await supabase
      .from('Carts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let cartId = existingCart?.id

    // Create cart if it doesn't exist
    if (!existingCart) {
      const { data: newCart, error: newCartError } = await supabase
        .from('Carts')
        .insert({ user_id: user.id })
        .select()
        .single()

      if (newCartError || !newCart) {
        toast.error('Failed to create cart')
        return
      }

      cartId = newCart.id
    }

    // Insert cart item
    const { error: insertError } = await supabase.from('CartItems').insert({
      cart_id: cartId,
      product_id: productId,
      quantity: quantity,
    })

    if (insertError) {
      toast.error('Failed to add to cart')
      console.error('Insert error:', insertError)
      return
    }

    toast.success('Item added to cart')
    router.push('/cart')
  }

  return (
    <button onClick={handleAddToCart} className="bg-black text-white px-4 py-2 rounded">
      Add to Cart
    </button>
  )
}
