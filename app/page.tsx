"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Truck, Shield, Headphones, Star } from "lucide-react"
import {useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useRouter} from "next/navigation";

interface Product {
  id: number
  name: string
  price: number
  original_price?: number
  category: string
  image: string
  badge?: string
  rating?: number
  reviews?: number
  created_at: string
  is_active: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [ reviewsCount, setReviewsCount ] = useState(0)
  const [sortBy, setSortBy] = useState("featured")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient()

      try {
        const { data: productsData, error: productsError } = await supabase
            .from("Products")
            .select(`
                        *,
                        Categories(name)
                    `)
            .eq("is_active", true) // Only fetch active products
            .order("created_at", { ascending: false })

        if (productsError) throw productsError

        const transformedProducts = productsData.map((product: any) => {
          let imageUrl = "/placeholder.svg";

          if (product.image) {
            if (typeof product.image == "string") {
              imageUrl = product.image
            } else if (product.image.url) {
              imageUrl = product.image.url
            }
          }
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            category: product.Categories?.name || 'Uncategorized',
            image: imageUrl,
            badge: product.badge,
            rating: product.rating || 0,
            reviews: reviewsCount,
            created_at: product.created_at,
            is_active: product.is_active
          }
        })

        setProducts(transformedProducts)

        // Then fetch reviews count for each product
        const productsWithReviews = await Promise.all(
            productsData.map(async (product: any) => {
              const { data: orderItems } = await supabase
                  .from('OrderItems')
                  .select('order_id')
                  .eq('product_id', product.id)

              let reviewsCount = 0
              let totalRating = 0

              if (orderItems && orderItems.length > 0) {
                const orderIds = orderItems.map(item => item.order_id)
                const { data: reviewsData } = await supabase
                    .from('Reviews')
                    .select('rating')
                    .in('order_id', orderIds)

                if (reviewsData && reviewsData.length > 0) {
                  reviewsCount = reviewsData.length
                  totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
                }
              }

              return {
                id: product.id,
                name: product.name,
                price: product.price,
                original_price: product.original_price,
                category: product.Categories?.name || 'Uncategorized',
                image: product.image ? product.image : "/placeholder.svg",
                badge: product.badge,
                rating: reviewsCount > 0 ? totalRating / reviewsCount : 0,
                reviews: reviewsCount,
                created_at: product.created_at,
                is_active: product.is_active
              }
            })
        )

        setProducts(productsWithReviews)

        const uniqueCategories = Array.from(
            new Set(transformedProducts.map(p => p.category))
        )
        setCategories(uniqueCategories)

      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const featuredProducts = products
      .filter(product => product.is_active)
      .sort((a, b) => {
        // Fallback to current date if created_at is invalid
        const dateA = a.created_at ? new Date(a.created_at).getTime() : Date.now()
        const dateB = b.created_at ? new Date(b.created_at).getTime() : Date.now()
        return dateB - dateA // Sort newest first
      })
      .slice(0, 3)

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
            <p className="text-gray-700 text-lg font-medium">Loading Page...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="flex flex-col ">
        <section
            className="relative bg-cover bg-center bg-no-repeat text-white"
            style={{ backgroundImage: "url('/inventory.jpg')" }}
        >
          <div className="bg-gradient-to-r from-black via-black/80 to-transparent absolute inset-0 z-0"></div>
          <div className="relative container px-4 md:px-8 py-32 md:py-40 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">Where Fashion Meets Affordability</h1>
                <p className="text-xl text-300 max-w-lg">
                  Trendsetting styles at prices that won’t break the bank, because looking good shouldn’t cost a fortune.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-[#6CA539] text-white px-5 py-2 rounded-md transition duration-300 hover:bg-[#5a8e2d]">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" className="bg-[#da6304] text-white px-5 py-2 rounded-md transition duration-300 hover:bg-[#c55a03]">
                    View Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-[#da6304]">
          <div className="container px-4 md:px-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Free Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over ₱100</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Secure Payment</h3>
                <p className="text-gray-600">Your payment information is safe</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">24/7 Support</h3>
                <p className="text-gray-600">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover our hand-picked selection of quality items</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                  <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-4 left-4">{product.badge}</Badge>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold">₱ {product.price}</span>
                          {product.original_price && (
                              <span className="text-gray-500 line-through">₱ {product.original_price}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                              <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                      i < Math.floor(product.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                  }`}
                              />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">({product.reviews} {product.reviews === 1 ? "Review" : "Reviews"})</span>
                        </div>

                        <Link href={`/product/${product.id}`}>
                          <Button className="w-full">View Product</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/storefront">
                <Button size="lg" variant="ghost" className="bg-[#6CA539] hover:bg-[#6CA539]/90 hover:text-white text-white">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="text-center bg-[#da6304] p-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you! Reach out to us through any of the methods below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:kiwangcherryl@gmail.com">
              <Button size="lg" className="bg-black text-white">Contact Us</Button>
            </a>
            <Link href="/visit">
              <Button size="lg" variant="ghost" className="bg-white">
                Visit Our Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
  )
}
