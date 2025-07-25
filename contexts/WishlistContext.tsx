"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

interface WishlistContextType {
    wishlistCount: number
    loading: boolean
    updateWishlistCount: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistCount, setWishlistCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const updateWishlistCount = async () => {
        try {
            console.log('Updating wishlist count...')

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.log('No user found, setting wishlist count to 0')
                setWishlistCount(0)
                setLoading(false)
                return
            }

            console.log('User found:', user.id)

            // Get wishlist items count
            const { count, error: wishlistError } = await supabase
                .from('Wishlist')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            if (wishlistError) {
                console.error('Error fetching wishlist items:', wishlistError)
                setWishlistCount(0)
                setLoading(false)
                return
            }

            console.log('Total wishlist count:', count || 0)

            setWishlistCount(count || 0)
            setLoading(false)
        } catch (error) {
            console.error('Error updating wishlist count:', error)
            setWishlistCount(0)
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('WishlistProvider mounted, updating wishlist count...')
        updateWishlistCount()
    }, [])

    const value = {
        wishlistCount,
        loading,
        updateWishlistCount
    }

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}