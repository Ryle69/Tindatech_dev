import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { ProductActions } from "./components/product-actions"
import {cookies} from "next/headers";

export default async function ProductsPage({
                                               searchParams,
                                           }: {
    searchParams: { success?: string; error?: string; search?: string }
}) {
    await requireAdmin()

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here
    const searchTerm = searchParams.search || ""

    let query = supabase
        .from("Products")
        .select(`
      *,
      Categories (
        name
      )
    `)
        .order("created_at", { ascending: false })

    if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
    }

    const { data: products } = await query

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your product catalog</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/admin/products/new">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Products</CardTitle>
                            <CardDescription>{products?.length || 0} products in your catalog</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <form method="GET" className="flex gap-2">
                                <Input name="search" placeholder="Search products..." defaultValue={searchTerm} className="w-64" />
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium">Product</th>
                                <th className="text-left py-3 px-4 font-medium">Category</th>
                                <th className="text-left py-3 px-4 font-medium">Price</th>
                                <th className="text-left py-3 px-4 font-medium">Stock</th>
                                <th className="text-left py-3 px-4 font-medium">Status</th>
                                <th className="text-left py-3 px-4 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products?.map((product: any) => (
                                <tr key={product.id} className="border-b">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-600">{product.sku || "No SKU"}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant="outline">{product.Categories?.name || "No Category"}</Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">${product.price}</p>
                                            {product.compare_price && (
                                                <p className="text-sm text-gray-500 line-through">${product.compare_price}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge
                                            variant={product.inventory_quantity <= product.low_stock_threshold ? "destructive" : "default"}
                                        >
                                            {product.inventory_quantity}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={product.is_active ? "default" : "secondary"}>
                                                {product.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                            {product.is_featured && <Badge variant="outline">Featured</Badge>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <ProductActions product={product} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
