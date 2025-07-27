'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Heart, ShoppingCart, Trash2, Star, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useCart } from '@/contexts/CartContext'

interface WishlistItem {
    id: number
    product_id: number
    created_at: string
    Products: {
        id: number
        name: string
        price: number
        original_price?: number
        image: string
        badge?: string
        inventory_quantity: number
        is_active: boolean
        Categories?: {
            name: string
        }
        compare_price?: number
        rating?: number
        reviews?: number
    }
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [movingToCart, setMovingToCart] = useState<number | null>(null)
    const [removingItem, setRemovingItem] = useState<number | null>(null)
    const [viewingDetails, setViewingDetails] = useState<number | null>(null)
    const [goingBackToShop, setGoingBackToShop] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { updateCartCount } = useCart()

    useEffect(() => {
        fetchWishlistItems()
    }, [])

    const handleViewDetails = (productId: number) => {
        setViewingDetails(productId)
        setTimeout(() => {
            router.push(`/product/${productId}`)
        }, 300)
    }

    const fetchWishlistItems = async () => {
        try {
            // Check authentication
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                router.push('/login?returnUrl=/wishlist')
                return
            }

            console.log('Fetching wishlist for user:', user.id)

            // Simplified query that matches your database structure exactly
            const { data, error } = await supabase
                .from('Wishlist')
                .select(`
          id,
          product_id,
          created_at,
          Products!inner (
            id,
            name,
            price,
            compare_price,
            image,
            category_id,
            inventory_quantity,
            is_active,
            sku,
            description,
            Categories (
              id,
              name
            )
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            console.log('Raw wishlist data:', data)

            if (!data || data.length === 0) {
                console.log('No wishlist items found')
                setWishlistItems([])
                return
            }

            // Transform the data to match our interface
            const transformedItems: WishlistItem[] = data?.map((item: any) => {
                console.log('Processing item:', item)

                const product = item.Products

                if (!product) {
                    console.warn('No product found for wishlist item:', item.id)
                    return null
                }

                // Handle image URL (from your database it's jsonb)
                let imageUrl = "/placeholder.svg"
                if (product.image) {
                    if (typeof product.image === "string") {
                        imageUrl = product.image
                    } else if (typeof product.image === "object" && product.image.url) {
                        imageUrl = product.image.url
                    } else if (typeof product.image === "object") {
                        // Handle other jsonb formats
                        imageUrl = product.image.src || product.image.path || "/placeholder.svg"
                    }
                }

                return {
                    id: item.id,
                    product_id: item.product_id,
                    created_at: item.created_at,
                    Products: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        original_price: product.compare_price || undefined,
                        image: imageUrl,
                        badge: undefined, // Your Products table doesn't have a badge column
                        inventory_quantity: product.inventory_quantity,
                        is_active: product.is_active,
                        Categories: product.Categories ? {
                            name: product.Categories.name
                        } : undefined,
                        compare_price: product.compare_price || undefined
                    }
                } as WishlistItem
            }).filter((item): item is WishlistItem => item !== null) || []

            const transformedWithReviews = await Promise.all(
                transformedItems.map(async (item) => {
                    // Fetch related order IDs for the product
                    const { data: orderItems } = await supabase
                        .from('OrderItems')
                        .select('order_id')
                        .eq('product_id', item.product_id)

                    let reviewsCount = 0
                    let totalRating = 0

                    if (orderItems && orderItems.length > 0) {
                        const orderIds = orderItems.map((o) => o.order_id)

                        const { data: reviews } = await supabase
                            .from('Reviews')
                            .select('rating')
                            .in('order_id', orderIds)

                        if (reviews && reviews.length > 0) {
                            reviewsCount = reviews.length
                            totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
                        }
                    }

                    const avgRating = reviewsCount > 0 ? totalRating / reviewsCount : 0

                    return {
                        ...item,
                        Products: {
                            ...item.Products,
                            rating: avgRating,
                            reviews: reviewsCount
                        }
                    }
                })
            )

            setWishlistItems(transformedWithReviews)
        } catch (error) {
            console.error('Error fetching wishlist:', error)
            toast.error(`Failed to load wishlist items: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const removeFromWishlist = async (wishlistItemId: number) => {
        setRemovingItem(wishlistItemId)

        try {
            const { error } = await supabase
                .from('Wishlist')
                .delete()
                .eq('id', wishlistItemId)

            if (error) throw error

            setWishlistItems(items => items.filter(item => item.id !== wishlistItemId))
            toast.success('Removed from wishlist')
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            toast.error('Failed to remove item from wishlist')
        } finally {
            setRemovingItem(null)
        }
    }

    const moveToCart = async (item: WishlistItem) => {
        setMovingToCart(item.product_id)

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                router.push('/login?returnUrl=/wishlist')
                return
            }

            // Check if product is still available
            if (!item.Products.is_active || item.Products.inventory_quantity <= 0) {
                toast.error('This product is no longer available')
                return
            }

            // Get or create user's cart
            let { data: cart, error: cartError } = await supabase
                .from("Carts")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle()

            if (cartError) throw cartError

            let cartId = cart?.id

            if (!cartId) {
                const { data: newCart, error: newCartError } = await supabase
                    .from("Carts")
                    .insert({
                        user_id: user.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single()

                if (newCartError) throw newCartError
                cartId = newCart.id
            }

            // Check if item already exists in cart
            const { data: existingItem, error: existingItemError } = await supabase
                .from("CartItems")
                .select("id, quantity")
                .eq("cart_id", cartId)
                .eq("product_id", item.product_id)
                .eq("size", "")
                .eq("color", "")
                .maybeSingle()

            if (existingItemError) throw existingItemError

            if (existingItem) {
                // Update existing item quantity
                const { error: updateError } = await supabase
                    .from("CartItems")
                    .update({
                        quantity: existingItem.quantity + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", existingItem.id)

                if (updateError) throw updateError
            } else {
                // Add new item to cart
                const { error: insertError } = await supabase
                    .from("CartItems")
                    .insert({
                        cart_id: cartId,
                        product_id: item.product_id,
                        quantity: 1,
                        size: null,
                        color: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })

                if (insertError) throw insertError
            }

            // Remove from wishlist
            await removeFromWishlist(item.id)

            // Update cart count
            await updateCartCount()

            toast.success('Moved to cart', {
                action: {
                    label: 'View Cart',
                    onClick: () => router.push('/cart')
                }
            })
        } catch (error) {
            console.error('Error moving to cart:', error)
            toast.error('Failed to move item to cart')
        } finally {
            setMovingToCart(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Image
                        src="/logo.svg"
                        alt="Loading Logo"
                        width={64}
                        height={64}
                        className="animate-pulse"
                    />
                    <p className="text-gray-700 text-lg font-medium">Compiling Wishlist...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                <p className="text-gray-600">
                    {wishlistItems.length === 0
                        ? "Your wishlist is empty"
                        : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved for later`
                    }
                </p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">
                        Save items you love to your wishlist and never lose track of them
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setGoingBackToShop(true)
                            setTimeout(() => {
                                router.push('/storefront')
                            }, 100)
                        }}
                        disabled={goingBackToShop}
                    >
                        {goingBackToShop ? (
                            <div className="flex items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2" />
                                Going Back to Shop
                            </div>
                        ) : (
                            'Continue Shopping'
                        )}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                                <div className="relative">
                                    <Link href={`/product/${item.Products.id}`}>
                                        <Image
                                            src={item.Products.image || '/placeholder.svg'}
                                            alt={item.Products.name}
                                            width={300}
                                            height={300}
                                            className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
                                        />
                                    </Link>
                                    {item.Products.badge && (
                                        <Badge className="absolute top-4 left-4">
                                            {item.Products.badge}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                                        onClick={() => removeFromWishlist(item.id)}
                                        disabled={removingItem === item.id}
                                    >
                                        {removingItem === item.id ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        )}
                                    </Button>
                                </div>

                                <div className="p-6">
                                    <Link href={`/product/${item.Products.id}`}>
                                        <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 cursor-pointer">
                                            {item.Products.name}
                                        </h3>
                                    </Link>

                                    {item.Products.Categories && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {item.Products.Categories.name}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold">
                      ${item.Products.price}
                    </span>
                                        {item.Products.original_price && (
                                            <span className="text-gray-500 line-through">
                        ${item.Products.original_price}
                      </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < Math.floor(item.Products.rating || 0)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-600 ml-2">({item.Products.reviews || 0} {item.Products.reviews === 1 ? "Review" : "Reviews"})</span>
                                    </div>
                                    <div className="space-y-2">
                                        {item.Products.is_active && item.Products.inventory_quantity > 0 ? (
                                            <Button
                                                className="w-full"
                                                onClick={() => moveToCart(item)}
                                                disabled={movingToCart === item.product_id}
                                            >
                                                {movingToCart === item.product_id ? (
                                                    'Moving to Cart...'
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                                        Move to Cart
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button className="w-full" disabled>
                                                Out of Stock
                                            </Button>
                                        )}

                                        <Link href={`/product/${item.Products.id}`} className="block">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => handleViewDetails(item.Products.id)}
                                                disabled={viewingDetails === item.Products.id}
                                            >
                                                {viewingDetails === item.Products.id ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2" />
                                                        Loading...
                                                    </div>
                                                ) : (
                                                    'View Details'
                                                )}
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                item.Products.is_active && item.Products.inventory_quantity > 0
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`} />
                                            <span>
                        {item.Products.is_active && item.Products.inventory_quantity > 0
                            ? "In Stock"
                            : "Out of Stock"
                        }
                      </span>
                                        </div>
                                        <span>
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {wishlistItems.length > 0 && (
                <div className="mt-12 text-center">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setGoingBackToShop(true)
                            // optional delay to show loading
                            setTimeout(() => {
                                router.push('/storefront')
                            }, 100)
                        }}
                        disabled={goingBackToShop}
                    >
                        {goingBackToShop ? (
                            <div className="flex items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2" />
                                Going Back to Shop
                            </div>
                        ) : (
                            'Continue Shopping'
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}