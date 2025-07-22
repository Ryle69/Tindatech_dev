"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

interface CartContextType {
    cartCount: number
    loading: boolean
    updateCartCount: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const updateCartCount = async () => {
        try {
            console.log('Updating cart count...')

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.log('No user found, setting cart count to 0')
                setCartCount(0)
                setLoading(false)
                return
            }

            console.log('User found:', user.id)

            // Get user's cart
            const { data: cartData, error: cartError } = await supabase
                .from('Carts')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (cartError || !cartData) {
                console.log('No cart found, setting count to 0')
                setCartCount(0)
                setLoading(false)
                return
            }

            console.log('Cart found:', cartData.id)

            // Get cart items count
            const { data: itemsData, error: itemsError } = await supabase
                .from('CartItems')
                .select('quantity')
                .eq('cart_id', cartData.id)

            if (itemsError) {
                console.error('Error fetching cart items:', itemsError)
                setCartCount(0)
                setLoading(false)
                return
            }

            const totalCount = (itemsData || []).reduce((sum, item) => sum + item.quantity, 0)
            console.log('Total cart count:', totalCount)

            setCartCount(totalCount)
            setLoading(false)
        } catch (error) {
            console.error('Error updating cart count:', error)
            setCartCount(0)
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('CartProvider mounted, updating cart count...')
        updateCartCount()
    }, [])

    const value = {
        cartCount,
        loading,
        updateCartCount
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}