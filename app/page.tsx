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

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      image: "/placeholder.svg?height=300&width=300",
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199,
      image: "/placeholder.svg?height=300&width=300",
      badge: "New",
    },
    {
      id: 3,
      name: "Minimalist Backpack",
      price: 89,
      image: "/placeholder.svg?height=300&width=300",
      badge: "Featured",
    },
  ]

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

  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
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

        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          category: product.Categories?.name || 'Uncategorized',
          image: product.image || "/placeholder.svg",
          badge: product.badge,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          created_at: product.created_at,
          is_active: product.is_active
        }))

        setProducts(transformedProducts)

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

  return (
    <div className="flex flex-col">
      <section className="relative bg-[#d7d2ae] text-white">
        <div className="container px-4 py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">Where Fashion Meets Affordability</h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Trendsetting styles at prices that won’t break the bank, because looking good shouldn’t cost a fortune.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  View Collection
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Hero Product"
                width={500}
                height={500}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#D86304]/70">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $100</p>
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
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our hand-picked selection of premium products</p>
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
                      <span className="text-2xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(24 reviews)</span>
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
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#D86304] text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 rounded-md text-black" />
            <Button className="bg-white text-black hover:bg-gray-100">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
