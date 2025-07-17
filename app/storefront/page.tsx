"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Star, Filter } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

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

export default function StorefrontPage() {
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
                    image: product.image ? product.image : "/placeholder.svg",
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

    const handleCategoryChange = (category: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, category])
        } else {
            setSelectedCategories(selectedCategories.filter((c) => c !== category))
        }
    }

    const filteredProducts = products.filter(
        (product) => selectedCategories.length === 0 || selectedCategories.includes(product.category)
    )

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.price - b.price
            case "price-high":
                return b.price - a.price
            case "rating":
                return (b.rating || 0) - (a.rating || 0)
            case "newest":
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            default:
                return 0
        }
    })

    if (loading) {
        return <div className="container px-4 py-8">Loading products...</div>
    }

    return (
        <div className="container px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Storefront</h1>
                <p className="text-gray-600">Discover our complete collection of premium products</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Showing {sortedProducts.length} of {products.length} products
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
                        {sortedProducts.map((product) => (
                            <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <Image
                                            src={product.image}
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
                                            {product.original_price && (
                                                <span className="text-gray-500 line-through">${product.original_price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-600 ml-2">({product.reviews || 0})</span>
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