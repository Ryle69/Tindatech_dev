import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search } from "lucide-react"
import Link from "next/link"

export default async function OrdersPage({
                                             searchParams,
                                         }: {
    searchParams: { search?: string; status?: string }
}) {
    await requireAdmin()

    const supabase = await createClient()
    const searchTerm = searchParams.search || ""
    const statusFilter = searchParams.status || ""

    let query = supabase.from("Orders").select("*").order("created_at", { ascending: false })

    if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%`)
    }

    if (statusFilter) {
        query = query.eq("status", statusFilter)
    }

    const { data: orders } = await query

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "default"
            case "shipped":
                return "secondary"
            case "processing":
                return "outline"
            case "cancelled":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600">Manage customer orders</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>{orders?.length || 0} orders total</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <form method="GET" className="flex gap-2">
                                <Input name="search" placeholder="Search orders..." defaultValue={searchTerm} className="w-64" />
                                <select name="status" defaultValue={statusFilter} className="rounded border px-3 py-2">
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <Button type="submit" variant="outline">
                                    Filter
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
                                <th className="text-left py-3 px-4 font-medium">Order</th>
                                <th className="text-left py-3 px-4 font-medium">Date</th>
                                <th className="text-left py-3 px-4 font-medium">Status</th>
                                <th className="text-left py-3 px-4 font-medium">Payment</th>
                                <th className="text-left py-3 px-4 font-medium">Total</th>
                                <th className="text-left py-3 px-4 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders?.map((order: any) => (
                                <tr key={order.id} className="border-b">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-gray-600">ID: {order.id}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                                            {order.payment_status}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-medium">${order.total_amount}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
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
