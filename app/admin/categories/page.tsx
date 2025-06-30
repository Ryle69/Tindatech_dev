import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package } from "lucide-react"
import Link from "next/link"
import { CategoryActions } from "./components/category-actions"

export default async function CategoriesPage({
                                                 searchParams,
                                             }: {
    searchParams: { success?: string; error?: string; search?: string }
}) {
    await requireAdmin()

    const supabase = await createClient()
    const searchTerm = searchParams.search || ""

    let query = supabase
        .from("Categories")
        .select(`
      *,
      Products!inner(count)
    `)
        .order("created_at", { ascending: false })

    if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
    }

    const { data: categories } = await query

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
            const { count } = await supabase
                .from("Products")
                .select("*", { count: "exact", head: true })
                .eq("category_id", category.id)

            return {
                ...category,
                product_count: count || 0,
            }
        }),
    )

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600">Organize your products into categories</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/admin/categories/new">
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Link>
                </Button>
            </div>

            {searchParams.success && (
                <div className="mb-6 rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-600">{decodeURIComponent(searchParams.success)}</p>
                </div>
            )}

            {searchParams.error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">{decodeURIComponent(searchParams.error)}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Categories</CardTitle>
                            <CardDescription>{categoriesWithCounts?.length || 0} categories in your store</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <form method="GET" className="flex gap-2">
                                <Input name="search" placeholder="Search categories..." defaultValue={searchTerm} className="w-64" />
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
                                <th className="text-left py-3 px-4 font-medium">Category</th>
                                <th className="text-left py-3 px-4 font-medium">Description</th>
                                <th className="text-left py-3 px-4 font-medium">Products</th>
                                <th className="text-left py-3 px-4 font-medium">Status</th>
                                <th className="text-left py-3 px-4 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categoriesWithCounts?.map((category: any) => (
                                <tr key={category.id} className="border-b">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-sm text-gray-600">{category.slug}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm text-gray-600 max-w-xs truncate">
                                            {category.description || "No description"}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span>{category.product_count}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <CategoryActions category={category} />
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
