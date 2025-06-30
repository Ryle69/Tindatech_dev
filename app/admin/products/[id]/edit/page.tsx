import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updateProduct } from "../../actions"
import { notFound } from "next/navigation"

export default async function EditProductPage({
                                                  params,
                                                  searchParams,
                                              }: {
    params: { id: string }
    searchParams: { error?: string }
}) {
    await requireAdmin()

    const supabase = await createClient()
    const productId = Number.parseInt(params.id)

    const [{ data: product }, { data: categories }] = await Promise.all([
        supabase.from("Products").select("*").eq("id", productId).single(),
        supabase.from("Categories").select("*").eq("is_active", true),
    ])

    if (!product) {
        notFound()
    }

    const updateProductWithId = updateProduct.bind(null, productId)

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-600">Update product information</p>
                </div>
            </div>

            {searchParams.error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">{decodeURIComponent(searchParams.error)}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>Update the details for this product</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateProductWithId} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input id="name" name="name" defaultValue={product.name} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" name="sku" defaultValue={product.sku || ""} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" rows={4} defaultValue={product.description || ""} />
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={product.price}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comparePrice">Compare Price</Label>
                                <Input
                                    id="comparePrice"
                                    name="comparePrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={product.compare_price || ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPrice">Cost Price</Label>
                                <Input
                                    id="costPrice"
                                    name="costPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={product.cost_price || ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select name="categoryId" defaultValue={product.category_id?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="inventoryQuantity">Inventory Quantity</Label>
                                <Input
                                    id="inventoryQuantity"
                                    name="inventoryQuantity"
                                    type="number"
                                    min="0"
                                    defaultValue={product.inventory_quantity || 1}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                <Input
                                    id="lowStockThreshold"
                                    name="lowStockThreshold"
                                    type="number"
                                    min="0"
                                    defaultValue={product.low_stock_threshold}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="trackInventory">Track Inventory</Label>
                                    <p className="text-sm text-gray-600">Monitor stock levels for this product</p>
                                </div>
                                <Switch id="trackInventory" name="trackInventory" defaultChecked={product.track_inventory} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="isActive">Active</Label>
                                    <p className="text-sm text-gray-600">Product is visible to customers</p>
                                </div>
                                <Switch id="isActive" name="isActive" defaultChecked={product.is_active} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="isFeatured">Featured</Label>
                                    <p className="text-sm text-gray-600">Show product in featured sections</p>
                                </div>
                                <Switch id="isFeatured" name="isFeatured" defaultChecked={product.is_featured} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit">Update Product</Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/products">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
