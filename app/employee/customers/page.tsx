import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Calendar, Search } from "lucide-react"
import {cookies} from "next/headers";
import {requireEmployee} from "@/utils/employee-middleware";

export default async function CustomersPage({
                                              searchParams,
                                            }: {
  searchParams: { success?: string; error?: string; search?: string }
}) {
  await requireEmployee()

  const supabase = await createClient(cookies())
  const searchTerm = searchParams.search || ""

  let query = supabase.from("Users").select("*").eq("role", "customer").order("created_at", { ascending: false })

  if (searchTerm) {
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  }

  const { data: customers } = await query

  return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer base</p>
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
                <CardTitle>All Customers</CardTitle>
                <CardDescription>{customers?.length || 0} registered customers</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <form method="GET" className="flex gap-2">
                  <Input name="search" placeholder="Search customers..." defaultValue={searchTerm} className="w-64" />
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
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Newsletter</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                </tr>
                </thead>
                <tbody>
                {customers?.map((customer: any) => (
                    <tr key={customer.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-gray-600">ID: {customer.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={customer.subscribe_newsletter ? "default" : "secondary"}>
                          {customer.subscribe_newsletter ? "Subscribed" : "Not Subscribed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
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
