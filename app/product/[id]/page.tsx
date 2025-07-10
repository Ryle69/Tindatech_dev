'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Heart, Share2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
  specifications: Record<string, string>
  features: string[]
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>() // Add type annotation
  const router = useRouter()
  const supabase = createClientComponentClient()

  console.log('Rendering ProductPage with ID:', id)
  console.log('Supabase client initialized:', !!supabase)
  console.log('Router ready:', !!router)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    console.log('Running test query for product ID:', id)
    supabase
        .from('Products')
        .select('*')
        .eq('id', id)
        .then(({ data, error }) => {
          console.log('Test query results:', { data, error })
        })
  }, [id, supabase])

  useEffect(() => {
    if (!id) {
      setError('Invalid product ID')
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        console.log(`Starting fetch for product ID: ${id}`)

        const { data, error: supabaseError } = await supabase
            .from('Products')
            .select(`
            *,
            Categories(name),
            image
          `)
            .eq('id', id)
            .eq('is_active', true)
            .single()

        console.log('Supabase query executed. Results:', {
          dataExists: !!data,
          error: supabaseError,
          query: `SELECT * FROM Products WHERE id = ${id} AND is_active = true`
        })

        if (supabaseError) {
          console.error('Supabase query error details:', {
            message: supabaseError.message,
            code: supabaseError.code,
            details: supabaseError.details
          })
          throw supabaseError
        }

        if (!data) {
          throw new Error('Product not found')
        }

        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          original_price: data.compare_price,
          description: data.description,
          images: data.ProductImages?.map((img: any) => img.image_url) || [data.image || '/placeholder.svg'],
          badge: data.badge,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          in_stock: (data.inventory_quantity || 0) > 0,
          sizes: data.sizes || [],
          colors: data.colors || [],
          specifications: {
            'Driver Size': '40mm',
            'Frequency Response': '20Hz - 20kHz',
            'Battery Life': '30 hours',
            'Weight': '250g',
            ...(typeof data.specifications === 'object' ? data.specifications : {})
          },
          features: [
            'Premium sound quality with deep bass',
            'Active noise cancellation technology',
            ...(Array.isArray(data.features) ? data.features : [])
          ]
        }

        setProduct(transformedProduct)
      } catch (err) {
        console.error('Complete error context:', {
          timestamp: new Date().toISOString(),
          productId: id,
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack
          } : err
        })
        setError(err instanceof Error ? err.message : 'Unknown error')
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, supabase, router])

  const handleAddToCart = async () => {
    if (!product) {
      console.error("Product not loaded")
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push(`/login?returnUrl=/product/${id}`) // Use id instead of params.id
        return
      }

      const { data: cart, error: cartError } = await supabase
          .from("Carts")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

      if (cartError) throw cartError

      let cartId = cart?.id

      if (!cartId) {
        const { data: newCart, error: newCartError } = await supabase
            .from("Carts")
            .insert({ user_id: user.id })
            .select()
            .single()

        if (newCartError) throw newCartError
        cartId = newCart.id
      }

      // Then add the item to the cart
      const { error } = await supabase
          .from("CartItems")
          .upsert({
            cart_id: cartId,
            product_id: product.id,
            quantity,
            size: selectedSize || null,
            color: selectedColor || null
          }, {
            onConflict: 'cart_id,product_id,size,color',
            ignoreDuplicates: false
          })

      if (error) throw error

      toast.success('Product added to cart')
      router.push("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error('Failed to add product to cart')
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
          <div className="space-y-4">
            <div className="relative">
              <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
              {product.badge && <Badge className="absolute top-4 left-4">{product.badge}</Badge>}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                  <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? "border-black" : "border-gray-200"
                      }`}
                  >
                    <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-20 object-cover"
                    />
                  </button>
              ))}
            </div>
          </div>

          {/* Product details section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                      <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}                      />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">${product.original_price}</span>
                )}
                {product.original_price && (
                    <Badge variant="destructive">Save ${product.original_price - product.price}</Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="space-y-4">
              {product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
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
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
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
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ${product.price * quantity}
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
              <span className="text-sm font-medium">{product.in_stock ? "In Stock" : "Out of Stock"}</span>
            </div>
          </div>
        </div>

        {/* Product tabs section */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
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
                  <h3 className="font-semibold mb-3">Technical Specifications</h3>
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-gray-600">{key}:</dt>
                          <dd>{value}</dd>
                        </div>
                    ))}
                  </dl>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              {/* Reviews content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}