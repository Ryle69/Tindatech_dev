"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Star, Filter } from "lucide-react"

export default function StorefrontPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured")

  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      category: "Electronics",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Sale",
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199,
      category: "Electronics",
      image: "/placeholder.svg?height=300&width=300",
      badge: "New",
      rating: 4.6,
      reviews: 89,
    },
    {
      id: 3,
      name: "Minimalist Backpack",
      price: 89,
      category: "Accessories",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.9,
      reviews: 156,
    },
    {
      id: 4,
      name: "Organic Cotton T-Shirt",
      price: 45,
      category: "Clothing",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Eco-Friendly",
      rating: 4.7,
      reviews: 203,
    },
    {
      id: 5,
      name: "Stainless Steel Water Bottle",
      price: 35,
      category: "Accessories",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.5,
      reviews: 78,
    },
    {
      id: 6,
      name: "Wireless Charging Pad",
      price: 59,
      category: "Electronics",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Featured",
      rating: 4.4,
      reviews: 92,
    },
  ]

  const categories = ["Electronics", "Clothing", "Accessories"]

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const filteredProducts = products.filter(
    (product) => selectedCategories.length === 0 || selectedCategories.includes(product.category),
  )

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Storefront</h1>
        <p className="text-gray-600">Discover our complete collection of premium products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={category} className="text-sm font-normal">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="under50" />
                    <Label htmlFor="under50" className="text-sm font-normal">
                      Under $50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="50to100" />
                    <Label htmlFor="50to100" className="text-sm font-normal">
                      $50 - $100
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="over100" />
                    <Label htmlFor="over100" className="text-sm font-normal">
                      Over $100
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
                    {product.badge && <Badge className="absolute top-4 left-4">{product.badge}</Badge>}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full">View Product</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
