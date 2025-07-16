"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCreateOrder() {
  const [form, setForm] = useState({
    user_id: "a1f4274b-2266-4c10-a221-547cf5d6c78d",
    order_number: "",
    status: "pending",
    product_id: "",
    quantity: 1,
    total_amount: "",
    shipping_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  // User dropdown removed; admin will input user_id manually
  const [productPrice, setProductPrice] = useState<number>(0);

  React.useEffect(() => {
    // Fetch products 
    const fetchData = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: productsData } = await supabase.from("Products").select("id, name, price").eq("is_active", true);
      setProducts(productsData || []);
    };
    fetchData();
  }, []);

  // Update price when product or quantity changes
  React.useEffect(() => {
    const selectedProduct = products.find(p => p.id === Number(form.product_id));
    if (selectedProduct) {
      setProductPrice(selectedProduct.price);
      const total = selectedProduct.price * Number(form.quantity);
      setForm(f => ({ ...f, total_amount: total.toFixed(2) }));
    }
  }, [form.product_id, form.quantity, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const shipping_address = form.shipping_address ? JSON.parse(form.shipping_address) : null;
      // Insert order first
      const { data: orderData, error: orderError } = await supabase.from("Orders").insert([
        {
          user_id: form.user_id, // user_id must remain a uuid string
          order_number: form.order_number,
          status: form.status,
          total_amount: parseFloat(form.total_amount),
          subtotal: parseFloat(form.total_amount), // subtotal = product price × quantity
          shipping_address,
        },
      ]).select();
      if (orderError) {
        setResult("Error: " + orderError.message);
        setLoading(false);
        return;
      }
      const order = Array.isArray(orderData) ? orderData[0] : orderData;
      // Insert order item
      // Find selected product for name and sku
      const selectedProduct = products.find(p => p.id === Number(form.product_id));
      const { error: itemError } = await supabase.from("OrderItems").insert([
        {
          order_id: order.id,
          product_id: Number(form.product_id), // product_id is always numeric
          product_name: selectedProduct?.name || "",
          product_sku: selectedProduct?.sku || "",
          quantity: Number(form.quantity),
          unit_price: productPrice,
          total_price: productPrice * Number(form.quantity),
        },
      ]);
      if (itemError) {
        setResult("Order created but failed to add item: " + itemError.message);
      } else {
        setResult("Order and item created successfully!");
      }
    } catch (err: any) {
      setResult("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>User ID</label>
              <Input name="user_id" value={form.user_id} onChange={handleChange} required placeholder="Enter user UUID" />
            </div>
            <div>
              <label>Order Number</label>
              <Input name="order_number" value={form.order_number} onChange={handleChange} required />
            </div>
            <div>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1">
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <label>Product</label>
              <select name="product_id" value={form.product_id} onChange={handleChange} required className="border rounded px-2 py-1 w-full">
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Quantity</label>
              <Input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} required />
            </div>
            <div>
              <label>Total Amount</label>
              <Input name="total_amount" value={form.total_amount} readOnly required type="number" step="0.01" />
            </div>
            <div>
              <label>Shipping Address (JSON)</label>
              <Input name="shipping_address" value={form.shipping_address} onChange={handleChange} placeholder='{"address_line1":"123 Main St","city":"City"}' />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
            {result && <div className="mt-2 text-sm">{result}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
