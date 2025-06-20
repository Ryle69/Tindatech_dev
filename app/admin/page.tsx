import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+8%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Active Products",
      value: "567",
      change: "+3%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Total Customers",
      value: "2,345",
      change: "+15%",
      changeType: "positive" as const,
      icon: Users,
    },
  ]

  const recentOrders = [
    { id: "#1234", customer: "John Doe", amount: "$299.00", status: "completed", date: "2024-01-15" },
    { id: "#1235", customer: "Jane Smith", amount: "$199.00", status: "processing", date: "2024-01-15" },
    { id: "#1236", customer: "Bob Johnson", amount: "$89.00", status: "shipped", date: "2024-01-14" },
    { id: "#1237", customer: "Alice Brown", amount: "$459.00", status: "pending", date: "2024-01-14" },
  ]

  const lowStockProducts = [
    { name: "Premium Headphones", stock: 5, sku: "PRD-001" },
    { name: "Smart Watch", stock: 3, sku: "PRD-002" },
    { name: "Wireless Charger", stock: 8, sku: "PRD-003" },
  ]

  return (
    <AdminLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">{order.amount}</p>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "processing"
                              ? "secondary"
                              : order.status === "shipped"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.sku} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
