"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Star, Filter, Search, X, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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

export default function StorefrontPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] }
}) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProductId, setLoadingProductId] = useState<number | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [reviewsCount, setReviewsCount] = useState(0)
    const [sortBy, setSortBy] = useState("featured")
    const [categories, setCategories] = useState<string[]>([])
    const router = useRouter()

    useEffect(() => {
        const urlSearchQuery = searchParams.search as string
        if (urlSearchQuery) {
            setSearchQuery(urlSearchQuery)
        }
    }, [searchParams])

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
                    .eq("is_active", true)
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

                const uniqueCategories = Array.from(
                    new Set(transformedProducts.map(p => p.category))
                )
                setCategories(uniqueCategories)

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

    const handlePriceRangeChange = (range: string, checked: boolean) => {
        if (checked) {
            setSelectedPriceRanges([...selectedPriceRanges, range])
        } else {
            setSelectedPriceRanges(selectedPriceRanges.filter((r) => r !== range))
        }
    }

    const checkPriceRange = (price: number, range: string): boolean => {
        switch (range) {
            case "under50":
                return price < 50
            case "50to100":
                return price >= 50 && price <= 100
            case "over100":
                return price > 100
            default:
                return false
        }
    }

    const clearSearch = () => {
        setSearchQuery("")
        // Remove search param from URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
    }

    // Filter products based on search, categories, and price ranges
    const filteredProducts = products.filter((product) => {
        // Search filter
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(product.category)

        // Price range filter
        const matchesPriceRange = selectedPriceRanges.length === 0 ||
            selectedPriceRanges.some(range => checkPriceRange(product.price, range))

        return matchesSearch && matchesCategory && matchesPriceRange
    })

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
                    <p className="text-gray-700 text-lg font-medium">Loading Storefront...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Storefront</h1>
                <p className="text-gray-600">Discover our complete collection of premium products</p>
                {searchQuery && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                Searching for: <strong>"{searchQuery}"</strong>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-[#f7f1c5] p-6 rounded-lg border-b border-[#ab5005]">
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
                                                checked={selectedCategories.includes(category)}
                                                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                                            />
                                            <Label htmlFor={category} className="text-sm font-normal">
                                                {category}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div>
                                <h3 className="font-medium mb-3">Price Range</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="under50"
                                            checked={selectedPriceRanges.includes("under50")}
                                            onCheckedChange={(checked) => handlePriceRangeChange("under50", checked as boolean)}
                                        />
                                        <Label htmlFor="under50" className="text-sm font-normal">
                                            Under ₱50
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="50to100"
                                            checked={selectedPriceRanges.includes("50to100")}
                                            onCheckedChange={(checked) => handlePriceRangeChange("50to100", checked as boolean)}
                                        />
                                        <Label htmlFor="50to100" className="text-sm font-normal">
                                            ₱50 - ₱100
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="over100"
                                            checked={selectedPriceRanges.includes("over100")}
                                            onCheckedChange={(checked) => handlePriceRangeChange("over100", checked as boolean)}
                                        />
                                        <Label htmlFor="over100" className="text-sm font-normal">
                                            Over ₱100
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <p className="text-gray-600">
                            Showing {sortedProducts.length} of {products.length} products
                            {searchQuery && ` for "${searchQuery}"`}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-8 rounded-md"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSearch}
                                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-48 bg-[#da6304]/90 border-0 text-white/90">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#da6304]/90">
                                    <SelectItem className="focus:bg-[#c55a03]/80" value="featured">Featured</SelectItem>
                                    <SelectItem className="focus:bg-[#c55a03]/80" value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem className="focus:bg-[#c55a03]/80" value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem className="focus:bg-[#c55a03]/80" value="rating">Highest Rated</SelectItem>
                                    <SelectItem className="focus:bg-[#c55a03]/80" value="newest">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {sortedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                {searchQuery ? (
                                    <>No products found matching "{searchQuery}"</>
                                ) : (
                                    <>No products match your current filters</>
                                )}
                            </div>
                            {(searchQuery || selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedCategories([])
                                        setSelectedPriceRanges([])
                                        const newUrl = window.location.pathname
                                        window.history.replaceState({}, '', newUrl)
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedProducts.map((product) => (
                                <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow border-[#ab5005]/50">
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
                                            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl font-bold">₱ {product.price}</span>
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
                                                <span className="text-sm text-gray-600 ml-2">({product.reviews} {product.reviews === 1 ? "Review" : "Reviews"})</span>
                                            </div>
                                            <Button
                                                className="w-full"
                                                disabled={loadingProductId === product.id}
                                                onClick={async () => {
                                                    if (loadingProductId) return
                                                    setLoadingProductId(product.id)
                                                    router.push(`/product/${product.id}`)
                                                }}
                                            >
                                                {loadingProductId === product.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Loading Product Details...
                                                    </>
                                                ) : (
                                                    "View Product"
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}