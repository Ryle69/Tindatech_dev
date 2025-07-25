import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updateCategory } from "../../actions"
import { notFound } from "next/navigation"
import {cookies} from "next/headers";

export default async function EditCategoryPage({
                                                   params,
                                                   searchParams,
                                               }: {
    params: { id: string }
    searchParams: { error?: string }
}) {
    await requireAdmin()

    const supabase = await createClient(cookies())
    const categoryId = Number.parseInt(params.id)

    const { data: category } = await supabase.from("Categories").select("*").eq("id", categoryId).single()

    if (!category) {
        notFound()
    }

    const updateCategoryWithId = updateCategory.bind(null, categoryId)

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
    <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
    <p className="text-gray-600">Update category information</p>
    </div>
    </div>

    {searchParams.error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-600">{decodeURIComponent(searchParams.error)}</p>
    </div>
    )}

    <Card>
        <CardHeader>
            <CardTitle>Category Information</CardTitle>
    <CardDescription>Update the details for this category</CardDescription>
    </CardHeader>
    <CardContent>
    <form action={updateCategoryWithId} className="space-y-6">
    <div className="space-y-2">
    <Label htmlFor="name">Category Name *</Label>
    <Input id="name" name="name" defaultValue={category.name} required />
    </div>

    <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={category.description || ""} />
    </div>

    <div className="flex items-center justify-between">
    <div>
        <Label htmlFor="isActive">Active</Label>
        <p className="text-sm text-gray-600">Category is visible to customers</p>
    </div>
    <Switch id="isActive" name="isActive" defaultChecked={category.is_active} />
    </div>

    <div className="flex gap-4">
    <Button type="submit">Update Category</Button>
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
