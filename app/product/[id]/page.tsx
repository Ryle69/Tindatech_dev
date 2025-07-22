'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Heart, Share2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProductImages from "@/components/productImages";
import {ReviewsList} from "@/components/reviewsList";
import {createClient} from "@/utils/supabase/client";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: number
  name: string
  price: number
  original_price?: number
  description: string
  images: string[]
  badge?: string
  rating?: number
  reviews?: number
  in_stock: boolean
  sizes: string[]
  colors: string[]
  specifications: Record<string, unknown> | null
  features: string[]
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const { updateCartCount } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedImage, setSelectedImage] = useState("")
  const [reviewsCount, setReviewsCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Invalid product ID')
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        const { data, error: supabaseError } = await supabase
            .from('Products')
            .select(`
            *,
            Categories(name)
          `)
            .eq('id', id)
            .eq('is_active', true)
            .single()

        if (supabaseError) throw supabaseError
        if (!data) throw new Error('Product not found')

        // Get reviews count and average rating
        const { data: orderItems } = await supabase
            .from('OrderItems')
            .select('order_id')
            .eq('product_id', id)

        let reviewsCount = 0
        let averageRating = 0

        if (orderItems && orderItems.length > 0) {
          const orderIds = orderItems.map(item => item.order_id)
          const { data: reviewsData } = await supabase
              .from('Reviews')
              .select('rating')
              .in('order_id', orderIds)

          if (reviewsData && reviewsData.length > 0) {
            reviewsCount = reviewsData.length
            averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
          }
        }

        setReviewsCount(reviewsCount)
        setAverageRating(averageRating)

        // Transform the data to match your Product interface
        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          original_price: data.compare_price,
          description: data.description || 'No description available',
          images: data.image ? [data.image] : ['/placeholder.svg'],
          badge: data.badge,
          rating: averageRating,
          reviews: reviewsCount,
          in_stock: (data.inventory_quantity || 0) > 0,
          sizes: data.sizes || [],
          colors: data.colors || [],
          specifications: typeof data.specifications === 'object' ? data.specifications : {},
          features: [
            'Premium sound quality with deep bass',
            'Active noise cancellation technology',
            ...(Array.isArray(data.features) ? data.features : [])
          ]
        }

        setProduct(transformedProduct)
      } catch (err) {
        console.error('Error loading product:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, supabase])

  const handleAddToCart = async () => {
    if (!product) return

    console.log('Starting add to cart process...', {
      productId: product.id,
      quantity,
      selectedSize,
      selectedColor,
      inStock: product.in_stock
    })

    if (!product.in_stock) {
      toast.error('This product is out of stock')
      return
    }

    // Validate required selections
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }

    setAddingToCart(true)

    try {
      // Enhanced authentication check
      console.log('Checking authentication...')

      // First, try to get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session check:', {
        session: session ? 'exists' : 'missing',
        sessionError,
        user: session?.user?.id
      })

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (!session || !session.user) {
        console.log('No session found, checking user...')

        // Fallback to getUser
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User check:', { user: user?.id, userError })

        if (userError || !user) {
          console.log('User not authenticated, redirecting to login')
          // Clear any bad cookies first
          await supabase.auth.signOut()
          router.push(`/login?returnUrl=/product/${id}`)
          return
        }

        // Use user from getUser if session failed
        var currentUser = user
      } else {
        var currentUser = session.user
      }

      console.log('Using user ID:', currentUser.id)

      // Get or create user's cart
      console.log('Getting user cart...')
      let { data: cart, error: cartError } = await supabase
          .from("Carts")
          .select("id")
          .eq("user_id", currentUser.id)
          .maybeSingle()

      console.log('Cart query result:', { cart, cartError })

      if (cartError) {
        console.error('Cart error:', cartError)
        throw cartError
      }

      let cartId = cart?.id

      if (!cartId) {
        console.log('Creating new cart...')
        const { data: newCart, error: newCartError } = await supabase
            .from("Carts")
            .insert({
              user_id: currentUser.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

        console.log('New cart result:', { newCart, newCartError })

        if (newCartError) {
          console.error('New cart error:', newCartError)
          throw newCartError
        }
        cartId = newCart.id
      }

      console.log('Using cart ID:', cartId)

      // Check if this exact product variant already exists in cart
      const { data: existingItem, error: existingItemError } = await supabase
          .from("CartItems")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("product_id", product.id)
          .eq("size", selectedSize || "")
          .eq("color", selectedColor || "")
          .maybeSingle()

      console.log('Existing item check:', { existingItem, existingItemError })

      if (existingItemError) {
        console.error('Existing item error:', existingItemError)
        throw existingItemError
      }

      if (existingItem) {
        console.log('Updating existing item...')
        // Update existing item quantity
        const { error: updateError } = await supabase
            .from("CartItems")
            .update({
              quantity: existingItem.quantity + quantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingItem.id)

        console.log('Update result:', { updateError })

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
      } else {
        console.log('Adding new item to cart...')
        // Add new item to cart
        const cartItemData = {
          cart_id: cartId,
          product_id: product.id,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('Cart item data:', cartItemData)

        const { data: insertedItem, error: insertError } = await supabase
            .from("CartItems")
            .insert(cartItemData)
            .select()

        console.log('Insert result:', { insertedItem, insertError })

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      }

      console.log('Successfully added to cart!')

      // Update cart count in the context
      await updateCartCount()

      toast.success('Added to cart', {
        action: {
          label: 'View Cart',
          onClick: () => router.push('/cart')
        }
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to add product to cart: ${errorMessage}`)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
        <div className="container px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="container px-4 py-8 text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
            <p className="font-medium">Error loading product</p>
            <p>{error}</p>
            <Button
                onClick={() => router.push('/storefront')}
                className="mt-4"
            >
              Back to Store
            </Button>
          </div>
        </div>
    )
  }

  if (!product) {
    return (
        <div className="container px-4 py-8 text-center">
          <p>Product not found</p>
          <Button
              onClick={() => router.push('/storefront')}
              className="mt-4"
          >
            Back to Store
          </Button>
        </div>
    )
  }

  return (
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product images section */}
          {product && <ProductImages product={product} />}

          {/* Product details section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                      <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">({reviewsCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">${product.original_price}</span>
                )}
                {product.original_price && (
                    <Badge variant="destructive">Save ${(product.original_price - product.price).toFixed(2)}</Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="space-y-4">
              {product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <Select
                        value={selectedColor}
                        onValueChange={setSelectedColor}
                        required={product.colors.length > 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              )}

              {product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <Select
                        value={selectedSize}
                        onValueChange={setSelectedSize}
                        required={product.sizes.length > 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.in_stock || quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {quantity >= 10 && (
                    <p className="text-sm text-gray-500 mt-1">Maximum quantity reached</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
              >
                {addingToCart ? (
                    'Adding...'
                ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {product.in_stock ?
                          `Add to Cart - $${(product.price * quantity).toFixed(2)}` :
                          'Out of Stock'}
                    </>
                )}
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.in_stock ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </span>
            </div>
          </div>
        </div>

        {/* Product tabs section */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewsCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <h3 className="text-lg font-semibold mt-6 mb-3">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Product Specifications</h3>
                  {product.specifications ? (
                      typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                          Object.keys(product.specifications).length > 0 ? (
                              <dl className="space-y-2">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <dt className="text-gray-600">{key}:</dt>
                                      <dd>
                                        {typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                      </dd>
                                    </div>
                                ))}
                              </dl>
                          ) : (
                              <p className="text-gray-500">No specifications available.</p>
                          )
                      ) : (
                          <p className="text-gray-500">
                            Specifications data is in an unexpected format.
                          </p>
                      )
                  ) : (
                      <p className="text-gray-500">No specifications available for this product.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-8">
                {reviewsCount === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet for this product.</p>
                      <Button variant="outline" className="mt-4">
                        Be the first to review
                      </Button>
                    </div>
                ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">Based on {reviewsCount} reviews</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <ReviewsList productId={product.id} />
                      </div>
                    </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}