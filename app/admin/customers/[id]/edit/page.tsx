import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updateCustomer } from "../../actions"
import { notFound } from "next/navigation"
import {cookies} from "next/headers";

export default async function EditCustomerPage({
                                                   params,
                                                   searchParams,
                                               }: {
    params: { id: string }
    searchParams: { error?: string }
}) {
    await requireAdmin()

    const supabase = await createClient(cookies())
    const customerId = Number.parseInt(params.id)

    const { data: customer } = await supabase
        .from("Users")
        .select("*")
        .eq("id", customerId)
        .eq("role", "customer")
        .single()

    if (!customer) {
        notFound()
    }

    const updateCustomerWithId = updateCustomer.bind(null, customerId)

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/customers">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Customers
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
                    <p className="text-gray-600">Update customer information</p>
                </div>
            </div>

            {searchParams.error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">{decodeURIComponent(searchParams.error)}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>Update the details for this customer</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateCustomerWithId} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input id="firstName" name="firstName" defaultValue={customer.first_name} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input id="lastName" name="lastName" defaultValue={customer.last_name} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" defaultValue={customer.email} required />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="subscribeNewsletter">Newsletter Subscription</Label>
                                <p className="text-sm text-gray-600">Customer receives marketing emails</p>
                            </div>
                            <Switch
                                id="subscribeNewsletter"
                                name="subscribeNewsletter"
                                defaultChecked={customer.subscribe_newsletter}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit">Update Customer</Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/customers">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
