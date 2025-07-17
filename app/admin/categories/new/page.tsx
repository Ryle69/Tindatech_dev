import { requireAdmin } from "@/utils/admin-middleware"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createCategory } from "../actions"

export default async function NewCategoryPage({
                                                  searchParams,
                                              }: {
    searchParams: { error?: string }
}) {
    await requireAdmin()

    const { error } = await searchParams

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/categories">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
                    <p className="text-gray-600">Create a new product category</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                    <CardDescription>Enter the details for your new category</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createCategory} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input id="name" name="name" placeholder="e.g., Clothing, Accessories" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Describe what products belong in this category..."
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="isActive">Active</Label>
                                <p className="text-sm text-gray-600">Category is visible to customers</p>
                            </div>
                            <Switch id="isActive" name="isActive" defaultChecked />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit">Create Category</Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/categories">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
