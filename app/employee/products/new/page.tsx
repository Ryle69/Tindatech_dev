import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/app/employee/products/components/product-form";
import {cookies} from "next/headers";
import {requireEmployee} from "@/utils/employee-middleware";

export default async function NewProductPage({
                                                 searchParams}: {
    searchParams: { error?: string }
}) {
    await requireEmployee()
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here
    const { data: categories } = await supabase.from("Categories").select("*").eq("is_active", true)
    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/employee/products">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                        <p className="text-gray-600">Create a new product for your store</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProductForm categories={categories || []} />
                </CardContent>
            </Card>
        </div>
    )
}
