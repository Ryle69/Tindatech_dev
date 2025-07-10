"use client"

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
import { createProduct } from "../actions"
import { ProductForm } from "@/app/admin/products/components/product-form";
import {cookies} from "next/headers";

export default async function NewProductPage({
                                                 searchParams}: {
    searchParams: { error?: string }
}) {
    await requireAdmin()
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here
    const { data: categories } = await supabase.from("Categories").select("*").eq("is_active", true)
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
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-600">Create a new product for your store</p>
                </div>
            </div>

            <Card>
                <CardHeader>...</CardHeader>
                <CardContent>
                    <ProductForm categories={categories || []} />
                </CardContent>
            </Card>
        </div>
    )
}
