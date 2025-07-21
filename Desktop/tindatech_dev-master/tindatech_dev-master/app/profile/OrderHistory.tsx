import React, { useEffect, useState } from "react";
import { fetchOrders } from "./fetch-orders";
import { Card, CardContent } from "@/components/ui/card";

interface OrderHistoryProps {
  userId?: string; // UUID
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

// For compatibility with old code, OrderItem is now an alias for OrderItem
// and UI will map fields as needed


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
  products?: OrderItem[];
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetchOrders(userId)
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load orders.');
        setLoading(false);
      });
  }, [userId]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // New: State for order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Fetch order items when modal opens
  useEffect(() => {
    if (!selectedOrder || !selectedOrder.id) {
      setOrderItems([]);
      return;
    }
    const fetchOrderItems = async () => {
      // You may need to import/createClient at the top if not already
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("OrderItems")
        .select("*")
        .eq("order_id", selectedOrder.id);
      if (!error && Array.isArray(data)) {
        setOrderItems(data);
      } else {
        setOrderItems([]);
      }
    };
    fetchOrderItems();
  }, [selectedOrder]);
  const [rating, setRating] = useState(0);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setReview("");
    setReviewSubmitted(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleReviewSubmit = () => {
    setReviewSubmitted(true);
    // Here you would send the review to your backend/database
  };

  if (!userId) {
    return <p className="text-sm text-muted-foreground">No user found.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your orders...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!orders || orders.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no orders yet.</p>;
  }

  // DEBUG: Show fetched order IDs
  const debugOrderIds = orders.map((o) => o.id).join(', ');

  return (
    <div>
      {/* DEBUG: Order IDs fetched from DB */}
      <div className="text-xs text-blue-700 mb-2">Fetched order IDs: {debugOrderIds}</div>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent
            className="mb-4 cursor-pointer hover:bg-gray-100 rounded border p-4"
            onClick={() => handleOrderClick(order)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">Order #{order.id}</div>
                <div className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                <div className="text-sm">{order.status}</div>
              </div>
              <div className="font-bold">${typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : '0.00'}</div>
            </div>
          </CardContent>
        </Card>
      ))}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw]">
            <h2 className="text-lg font-bold mb-2">Order Details</h2>
            <div className="mb-2">
              <div><span className="font-semibold">Order ID:</span> {selectedOrder.id}</div>
              <div><span className="font-semibold">Status:</span> {selectedOrder.status}</div>
              <div><span className="font-semibold">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
              {['shipped', 'delivered'].includes(selectedOrder.status) && selectedOrder.shipped_at ? (
                <div><span className="font-semibold">Shipped at:</span> {new Date(selectedOrder.shipped_at).toLocaleString()}</div>
              ) : (
                <div><span className="font-semibold text-blue-400">To be shipped</span></div>
              )}
              {selectedOrder.status === 'delivered' && selectedOrder.delivered_at ? (
                <div><span className="font-semibold">Delivered at:</span> {new Date(selectedOrder.delivered_at).toLocaleString()}</div>
              ) : (
                <div><span className="font-semibold text-green-400">To be delivered</span></div>
              )}
              <div className="mt-4 mb-2">
                <span className="font-semibold block mb-1">Order Summary:</span>
                {orderItems.length > 0 ? (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">OrderItem</th>
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
                          <td className="text-right">${item.unit_price.toFixed(2)}</td>
                          <td className="text-right">${item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-muted-foreground">No products found for this order.</div>
                )}
              </div>
              <div className="font-semibold text-right">Total: ${typeof selectedOrder.total_amount === 'number' ? selectedOrder.total_amount.toFixed(2) : '0.00'}</div>
            </div>
            {/* Address and delivery info */}
            {/* DEBUG: Print full order object */}
             <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center z-10"
              aria-label="Close order details"
              onClick={closeModal}
            >
              ×
            </button>
            <div className="mt-4">
              <span className="font-semibold block mb-1">Delivery Address:</span>
              <div className="text-sm">
                <div>{selectedOrder.shipping_address?.address_line1 || 'N/A'}</div>
                {selectedOrder.shipping_address?.address_line2 ? <div>{selectedOrder.shipping_address.address_line2}</div> : null}
                <div>{[selectedOrder.shipping_address?.city, selectedOrder.shipping_address?.province, selectedOrder.shipping_address?.region].filter(Boolean).join(', ') || 'N/A'}</div>
                <div>{selectedOrder.shipping_address?.country || 'N/A'} {selectedOrder.shipping_address?.postal_code || ''}</div>
                {selectedOrder.shipping_address?.landmark ? <div><span className="font-semibold">Landmark:</span> {selectedOrder.shipping_address.landmark}</div> : null}
                {selectedOrder.shipping_address?.notes ? <div><span className="font-semibold">Notes:</span> {selectedOrder.shipping_address.notes}</div> : null}
              </div>
            </div>
            {selectedOrder.status?.toLowerCase() === "delivered" && !reviewSubmitted && (
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Leave a Review</h3>
                <div className="flex items-center mb-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                      aria-label={`Set rating to ${star}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={star <= rating ? "#fbbf24" : "#e5e7eb"}
                        className="w-6 h-6"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-yellow-500 font-medium">{rating > 0 ? rating : ''}</span>
                </div>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Write your review here..."
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                  onClick={handleReviewSubmit}
                  disabled={!review.trim() || rating === 0}
                >
                  Submit Review
                </button>
              </div>
            )}
            {reviewSubmitted && (
              <div className="mt-2 text-green-700 font-semibold">Thank you for your review!</div>
            )}
            <button
              className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
