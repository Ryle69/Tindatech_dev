"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import { AdminOrderModal } from "./AdminOrderModal";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

interface ShippingAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  region: string;
  country: string;
  postal_code: string;
  landmark?: string;
  notes?: string;
}

interface Order {
  id: number;
  order_number: string;
  user_id?: string | null;
  status: string;
  payment_status?: string;
  payment_method?: string;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  shipping_address?: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

interface OrdersClientProps {
  orders: Order[];
  searchTerm?: string;
  statusFilter?: string;
}

export default function OrdersClient({ orders, searchTerm = "", statusFilter = "" }: OrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>(orders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    setModalLoading(true);
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase.from("OrderItems").select("*").eq("order_id", orderId);
    setOrderItems(Array.isArray(data) ? data : []);
    setModalLoading(false);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setModalOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setModalLoading(true);
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    // Prepare update fields
    const updateFields: any = { status: newStatus };
    const now = new Date().toISOString();
    if (newStatus === "shipped") updateFields.shipped_at = now;
    if (newStatus === "delivered") updateFields.delivered_at = now;
    await supabase.from("Orders").update(updateFields).eq("id", selectedOrder.id);
    setSelectedOrder({ ...selectedOrder, status: newStatus, ...updateFields });
    setAllOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status: newStatus, ...updateFields } : o));
    setModalLoading(false);
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    setModalLoading(true);
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    await supabase.from("Orders").delete().eq("id", selectedOrder.id);
    setModalOpen(false);
    setAllOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
    setModalLoading(false);
  };

  // Handler for payment status change
  async function handlePaymentStatusChange(newPaymentStatus: string) {
    if (!selectedOrder) return;
    setModalLoading(true);
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    await supabase.from("Orders").update({ payment_status: newPaymentStatus }).eq("id", selectedOrder.id);
    setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
    setAllOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, payment_status: newPaymentStatus } : o));
    setModalLoading(false);
  }

  // State for status filter
  const [status, setStatus] = useState<string>("all");

  // Filter orders based on status
  const filteredOrders = status === "all"
    ? allOrders
    : allOrders.filter((order) => order.status === status);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders</p>
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <label htmlFor="status-filter" className="font-medium">Filter by status:</label>
        <select
          id="status-filter"
          className="rounded border px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>{filteredOrders?.length || 0} orders total</CardDescription>
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
                {filteredOrders?.map((order) => (
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
                      <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {modalOpen && selectedOrder && (
        <AdminOrderModal
          order={selectedOrder}
          orderItems={orderItems}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteOrder}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      )}
    </div>
  );
}
