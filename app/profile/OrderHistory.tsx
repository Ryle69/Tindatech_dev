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
  canCancel?: boolean;
}

interface OrderHistoryProps {
  userId?: string;
}

const renderStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "delivered":
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Delivered</span>;
    case "shipped":
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Shipped</span>;
    case "cancelled":
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Cancelled</span>;
    case "pending":
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
    case "processing":
      return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Processing</span>;
    case "confirmed":
      return <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">Confirmed</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
  }
};

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

  const handleOrderClick = (order: Order) => {
    const canCancel = ["pending", "processing", "confirmed"].includes(order.status.toLowerCase());
    setSelectedOrder({ ...order, canCancel });
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

const CancelOrderButton = ({
                             orderId,
                             onSuccess
                           }: {
  orderId: number;
  onSuccess: () => void;
}) => {
  const [reason, setReason] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
          .from("Orders")
          .update({
            status: "pending",
            notes: reason,
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);

      if (error) throw error;

      setDone(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Cancellation error:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
        <div className="text-sm text-green-600">
          Order cancellation is being processed.
        </div>
    );
  }

  return (
      <>
        {!showPrompt ? (
            <button
                onClick={() => setShowPrompt(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancel Order
            </button>
        ) : (
            <div className="mt-2">
          <textarea
              className="w-full border rounded p-2 mb-2 text-sm"
              placeholder="State your reason for cancelling..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
          />
              {error && (
                  <div className="text-sm text-red-600 mb-2">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={!reason.trim() || loading}
                >
                  {loading ? "Processing..." : "Confirm Cancellation"}
                </button>
                <button
                    onClick={() => {
                      setReason("");
                      setShowPrompt(false);
                      setError(null);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
        )}
      </>
  );
};

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
      <div className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative">
        <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center z-10"
            onClick={onClose}
            aria-label="Close order details"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-4">Order #{order.order_number || order.id}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Information</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Status:</span> {renderStatusBadge(order.status)}</div>
                <div><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</div>
                <div><span className="font-medium">Payment Method:</span> {order.payment_method || "N/A"}</div>
                <div><span className="font-medium">Payment Status:</span> {order.payment_status || "N/A"}</div>

                {order.shipped_at && (
                    <div><span className="font-medium">Shipped at:</span> {new Date(order.shipped_at).toLocaleString()}</div>
                )}

                {order.delivered_at ? (
                    <div><span className="font-medium">Delivered at:</span> {new Date(order.delivered_at).toLocaleString()}</div>
                ) : (
                    <div><span className="text-green-600">To be delivered</span></div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              {orderItems.length > 0 ? (
                  <div className="border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Product</th>
                        <th className="text-center py-2 px-3">Qty</th>
                        <th className="text-right py-2 px-3">Price</th>
                        <th className="text-right py-2 px-3">Subtotal</th>
                      </tr>
                      </thead>
                      <tbody>
                      {orderItems.map(item => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 px-3">{item.product_name}</td>
                            <td className="text-center py-2 px-3">{item.quantity}</td>
                            <td className="text-right py-2 px-3">${item.unit_price.toFixed(2)}</td>
                            <td className="text-right py-2 px-3">${item.total_price.toFixed(2)}</td>
                          </tr>
                      ))}
                      </tbody>
                      <tfoot>
                      {order.subtotal !== undefined && (
                          <tr className="border-b">
                            <td colSpan={3} className="text-right py-2 px-3 font-medium">Subtotal</td>
                            <td className="text-right py-2 px-3">${order.subtotal?.toFixed(2)}</td>
                          </tr>
                      )}
                      {order.shipping_amount !== undefined && (
                          <tr className="border-b">
                            <td colSpan={3} className="text-right py-2 px-3 font-medium">Shipping</td>
                            <td className="text-right py-2 px-3">${order.shipping_amount?.toFixed(2)}</td>
                          </tr>
                      )}
                      {order.tax_amount !== undefined && (
                          <tr className="border-b">
                            <td colSpan={3} className="text-right py-2 px-3 font-medium">Tax</td>
                            <td className="text-right py-2 px-3">${order.tax_amount?.toFixed(2)}</td>
                          </tr>
                      )}
                      {order.discount_amount !== undefined && (
                          <tr className="border-b">
                            <td colSpan={3} className="text-right py-2 px-3 font-medium">Discount</td>
                            <td className="text-right py-2 px-3">-${order.discount_amount?.toFixed(2)}</td>
                          </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="text-right py-2 px-3 font-bold">Total</td>
                        <td className="text-right py-2 px-3 font-bold">${order.total_amount?.toFixed(2) || "0.00"}</td>
                      </tr>
                      </tfoot>
                    </table>
                  </div>
              ) : (
                  <div className="text-sm text-muted-foreground">No products found</div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <AddressDisplay address={order.shipping_address} />
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Billing Address</h3>
              <AddressDisplay address={order.billing_address} />
            </div>

            {order.notes && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Order Notes</h3>
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    {order.notes}
                  </div>
                </div>
            )}
          </div>
        </div>

        {renderReviewSection()}

        {order.canCancel && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Order Actions</h3>
              <CancelOrderButton orderId={order.id} onSuccess={onClose} />
            </div>
        )}

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
  if (!address) return <div className="text-sm text-gray-500">N/A</div>;

  return (
      <div className="text-sm bg-gray-50 p-3 rounded">
        <div className="font-medium mb-1">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
        </div>
        <div>
          {[address.city, address.province, address.region].filter(Boolean).join(", ")}
        </div>
        <div>
          {address.country} {address.postal_code && `, ${address.postal_code}`}
        </div>
        {address.landmark && (
            <div className="mt-1">
              <span className="font-medium">Landmark:</span> {address.landmark}
            </div>
        )}
        {address.notes && (
            <div className="mt-1">
              <span className="font-medium">Delivery Notes:</span> {address.notes}
            </div>
        )}
      </div>
  );
};

export default OrderHistory;