import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { fetchOrders } from "./fetch-orders";

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

interface Review {
  id: number;
  user_id: string;
  order_id: number;
  rating: number;
  review: string;
  created_at: string;
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
  products?: OrderItem[];
  review?: number;
  Reviews?: Review;
}

interface OrderHistoryProps {
  userId?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    if (!userId) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchOrders(userId);
        setOrders(data || []);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  // Fetch order items when modal opens
  useEffect(() => {
    if (!selectedOrder?.id) {
      setOrderItems([]);
      return;
    }

    const loadOrderItems = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
          .from("OrderItems")
          .select("*")
          .eq("order_id", selectedOrder.id);

      if (!error && data) {
        setOrderItems(data);
      }
    };

    loadOrderItems();
  }, [selectedOrder]);

  // Handlers
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

  const handleReviewSubmit = async () => {
    if (!selectedOrder || !userId || !review.trim() || rating === 0) {
      setError("Please provide a rating and review text");
      return;
    }

    if (selectedOrder.review) {
      setError("You have already submitted a review for this order");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get first product ID from order items for the review
      const productId = orderItems[0]?.product_id;

      const { data: reviewData, error: reviewError } = await supabase
          .from("Reviews")
          .insert([{
            user_id: userId,
            order_id: selectedOrder.id,
            rating,
            review,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

      if (reviewError) throw reviewError;

      const { error: orderError } = await supabase
          .from("Orders")
          .update({ review: reviewData.id })
          .eq("id", selectedOrder.id);

      if (orderError) {
        // Rollback review creation
        await supabase.from("Reviews").delete().eq("id", reviewData.id);
        throw orderError;
      }

      setReviewSubmitted(true);
      setOrders(orders.map(order =>
          order.id === selectedOrder.id
              ? { ...order, review: reviewData.id, Reviews: reviewData }
              : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      console.error("Review submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <span className="text-green-400">Delivered</span>;
      case "shipped":
        return <span className="text-blue-400">Shipped</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  const renderOrderSummary = () => {
    if (orderItems.length === 0) {
      return <div className="text-sm text-muted-foreground">No products found</div>;
    }

    return (
        <table className="w-full text-sm border-collapse">
          <thead>
          <tr className="border-b">
            <th className="text-left py-1">Product</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Subtotal</th>
          </tr>
          </thead>
          <tbody>
          {orderItems.map(item => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">${item.unit_price.toFixed(2)}</td>
                <td className="text-right">${item.total_price.toFixed(2)}</td>
              </tr>
          ))}
          </tbody>
        </table>
    );
  };

  const renderReviewSection = () => {
    if (selectedOrder?.status?.toLowerCase() !== "delivered") return null;

    if (selectedOrder.Reviews || selectedOrder.review || reviewSubmitted) {
      return (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Your Review</h3>
            {selectedOrder.Reviews && (
                <>
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon key={star} filled={star <= selectedOrder.Reviews!.rating} />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                  {new Date(selectedOrder.Reviews.created_at).toLocaleDateString()}
                </span>
                  </div>
                  <p className="text-sm">{selectedOrder.Reviews.review}</p>
                </>
            )}
            {reviewSubmitted && !selectedOrder.Reviews && (
                <div className="text-green-700 font-semibold">
                  Thank you for your review!
                </div>
            )}
          </div>
      );
    }

    return (
        <>
          <h3 className="font-semibold mb-1">Leave a Review</h3>
          <StarRating rating={rating} onRatingChange={setRating} />
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
        </>
    );
  };

  // Component rendering
  if (!userId) {
    return <p className="text-sm text-muted-foreground">No user found.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your orders...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no orders yet.</p>;
  }

  return (
      <div>
        <div className="text-xs text-blue-700 mb-2">
          Fetched order IDs: {orders.map(o => o.id).join(", ")}
        </div>

        {orders.map(order => (
            <Card key={order.id} className="mb-4">
              <CardContent
                  className="cursor-pointer hover:bg-gray-100 rounded p-4"
                  onClick={() => handleOrderClick(order)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Order #{order.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm">{renderStatusBadge(order.status)}</div>
                  </div>
                  <div className="font-bold">
                    ${order.total_amount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}

        {showModal && selectedOrder && (
            <OrderModal
                order={selectedOrder}
                orderItems={orderItems}
                onClose={closeModal}
                renderReviewSection={renderReviewSection}
            />
        )}
      </div>
  );
};

// Helper components
const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={filled ? "#fbbf24" : "#e5e7eb"}
        className="w-5 h-5"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
    </svg>
);

const StarRating = ({
                      rating,
                      onRatingChange
                    }: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) => (
    <div className="flex items-center mb-2">
      {[1, 2, 3, 4, 5].map(star => (
          <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="focus:outline-none"
              aria-label={`Rate ${star} stars`}
          >
            <StarIcon filled={star <= rating} />
          </button>
      ))}
      <span className="ml-2 text-yellow-500 font-medium">
      {rating > 0 ? rating : ""}
    </span>
    </div>
);

const OrderModal = ({
                      order,
                      orderItems,
                      onClose,
                      renderReviewSection
                    }: {
  order: Order;
  orderItems: OrderItem[];
  onClose: () => void;
  renderReviewSection: () => React.ReactNode;
}) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw] relative">
        <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center z-10"
            onClick={onClose}
            aria-label="Close order details"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-2">Order Details</h2>

        <div className="mb-2">
          <div><span className="font-semibold">Order ID:</span> {order.id}</div>
          <div><span className="font-semibold">Status:</span> {order.status}</div>
          <div><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleString()}</div>

          {order.shipped_at && (
              <div><span className="font-semibold">Shipped at:</span> {new Date(order.shipped_at).toLocaleString()}</div>
          )}

          {order.delivered_at ? (
              <div><span className="font-semibold">Delivered at:</span> {new Date(order.delivered_at).toLocaleString()}</div>
          ) : (
              <div><span className="font-semibold text-green-400">To be delivered</span></div>
          )}

          <div className="mt-4 mb-2">
            <span className="font-semibold block mb-1">Order Summary:</span>
            {orderItems.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Product</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                  </thead>
                  <tbody>
                  {orderItems.map(item => (
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
                <div className="text-sm text-muted-foreground">No products found</div>
            )}
          </div>

          <div className="font-semibold text-right">
            Total: ${order.total_amount?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="mt-4">
          <span className="font-semibold block mb-1">Delivery Address:</span>
          <AddressDisplay address={order.shipping_address} />
        </div>

        {renderReviewSection()}

        <button
            className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
);

const AddressDisplay = ({ address }: { address?: ShippingAddress }) => {
  if (!address) return <div className="text-sm">N/A</div>;

  return (
      <div className="text-sm">
        <div>{address.address_line1}</div>
        {address.address_line2 && <div>{address.address_line2}</div>}
        <div>
          {[address.city, address.province, address.region].filter(Boolean).join(", ") || "N/A"}
        </div>
        <div>
          {address.country || "N/A"} {address.postal_code || ""}
        </div>
        {address.landmark && (
            <div><span className="font-semibold">Landmark:</span> {address.landmark}</div>
        )}
        {address.notes && (
            <div><span className="font-semibold">Notes:</span> {address.notes}</div>
        )}
      </div>
  );
};

export default OrderHistory;