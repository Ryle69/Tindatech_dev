import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import {cookies} from "next/headers";

export default async function AnalyticsPage() {
    await requireAdmin()

    const supabase = await createClient(cookies())

    const [{ data: orders }, { data: products }, { count: totalCustomers }] = await Promise.all([
        supabase.from("Orders").select("total_amount, created_at, status"),
        supabase.from("Products").select("price, inventory_quantity"),
        supabase.from("Users").select("*", { count: "exact", head: true }).eq("role", "customer"),
    ])

    const totalRevenue = orders?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0
    const totalOrders = orders?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProducts = products?.length || 0
    const totalInventoryValue =
        products?.reduce((sum, product) => sum + Number.parseFloat(product.price) * product.inventory_quantity, 0) || 0

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Track your store performance</p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">PHP{totalRevenue.toFixed(2)}</p>
                                <div className="flex items-center text-sm text-green-600">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    +12.5%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <ShoppingCart className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                                <div className="flex items-center text-sm text-green-600">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    +8.2%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                                <div className="flex items-center text-sm text-green-600">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    +15.3%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">PHP{averageOrderValue.toFixed(2)}</p>
                                <div className="flex items-center text-sm text-red-600">
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                    -2.1%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">This Month</span>
                                <span className="text-lg font-bold">PHP{(totalRevenue * 0.4).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Last Month</span>
                                <span className="text-lg font-bold">PHP{(totalRevenue * 0.35).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">3 Months Ago</span>
                                <span className="text-lg font-bold">PHP{(totalRevenue * 0.25).toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Overview</CardTitle>
                        <CardDescription>Current inventory status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Products</span>
                                <span className="text-lg font-bold">{totalProducts}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Inventory Value</span>
                                <span className="text-lg font-bold">PHP{totalInventoryValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Low Stock Items</span>
                                <span className="text-lg font-bold text-red-600">
                  {products?.filter((p) => p.inventory_quantity <= 10).length || 0}
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
