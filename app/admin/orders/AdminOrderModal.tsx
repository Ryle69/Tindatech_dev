"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  firstName: string;
  lastName: string;
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
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

interface AdminOrderModalProps {
  order: Order;
  orderItems: OrderItem[];
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onPaymentStatusChange: (paymentStatus: string) => void;
}

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatusOptions = [
  "unpaid",
  "pending",
  "paid",
  "refunded",
  "failed",
];

// Helper function to parse shipping address
const parseShippingAddress = (address: any): ShippingAddress => {
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (e) {
      console.error('Failed to parse shipping address', e);
      return {
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        firstName: '',
        lastName: ''
      };
    }
  }
  return address;
};

export const AdminOrderModal: React.FC<AdminOrderModalProps> = ({
  order,
  orderItems,
  open,
  onClose,
  onStatusChange,
  onDelete,
  onPaymentStatusChange,
}) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.payment_status || "unpaid");
  const [loading, setLoading] = useState(false);
  const shippingAddress = parseShippingAddress(order.shipping_address);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2">Order #{order.order_number}</h2>
        <div className="mb-2">
          <Badge variant="outline">{order.status}</Badge>
          <span className="ml-3 text-sm text-gray-600">Placed: {new Date(order.created_at).toLocaleString()}</span>
          {(['shipped', 'delivered'].includes(order.status) && order.shipped_at) ? (
            <span className="ml-3 text-sm text-blue-700">Shipped: {new Date(order.shipped_at).toLocaleString()}</span>
          ) : (
            <span className="ml-3 text-sm text-blue-400">To be shipped</span>
          )}
          {(order.status === 'delivered' && order.delivered_at) ? (
            <span className="ml-3 text-sm text-green-700">Delivered: {new Date(order.delivered_at).toLocaleString()}</span>
          ) : (
            <span className="ml-3 text-sm text-green-400">To be delivered</span>
          )}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Total:</span> PHP{order.total_amount?.toFixed(2) ?? "0.00"}
        </div>
        {shippingAddress && (
            <div className="mb-4">
              <span className="font-semibold">Shipping Address:</span>
              <table className="ml-2 text-sm border-collapse mt-1">
                <tbody>
                <tr>
                  <td className="font-medium pr-4 py-1 align-top">Recipient:</td>
                  <td className="py-1">{shippingAddress.firstName} {shippingAddress.lastName}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-4 py-1 align-top">Address:</td>
                  <td className="py-1">{shippingAddress.address}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-4 py-1 align-top">City/State:</td>
                  <td className="py-1">{shippingAddress.city}, {shippingAddress.state}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-4 py-1 align-top">Country/Zip:</td>
                  <td className="py-1">{shippingAddress.country} {shippingAddress.zip}</td>
                </tr>
                </tbody>
              </table>
            </div>
        )}
        <div className="mb-4">
          <span className="font-semibold">Order Items:</span>
          {orderItems.length > 0 ? (
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Product</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">PHP{item.unit_price.toFixed(2)}</td>
                    <td className="text-right">PHP{item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-muted-foreground">No products found for this order.</div>
          )}
        </div>
        <div className="mb-4">
          <label className="font-semibold mr-2">Change Status:</label>
          <select
            className="border rounded px-2 py-1"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <Button
            className="ml-2"
            size="sm"
            disabled={loading || newStatus === order.status}
            onClick={async () => {
              setLoading(true);
              await onStatusChange(newStatus);
              setLoading(false);
            }}
          >
            Update
          </Button>
        </div>
        <div className="mb-4">
          <label className="font-semibold mr-2">Change Payment Status:</label>
          <select
            className="border rounded px-2 py-1"
            value={newPaymentStatus}
            onChange={(e) => setNewPaymentStatus(e.target.value)}
          >
            {paymentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <Button
            className="ml-2"
            size="sm"
            disabled={loading || newPaymentStatus === order.payment_status}
            onClick={async () => {
              setLoading(true);
              await onPaymentStatusChange(newPaymentStatus);
              setLoading(false);
            }}
          >
            Update
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete Order
          </Button>
          {/* Add more admin actions here if needed */}
        </div>
      </div>
    </div>
  );
};
