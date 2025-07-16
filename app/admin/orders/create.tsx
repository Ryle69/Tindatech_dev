"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCreateOrder() {
  const [form, setForm] = useState({
    user_id: "",
    order_number: "",
    status: "pending",
    total_amount: "",
    shipping_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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
      const { error } = await supabase.from("Orders").insert([
        {
          user_id: form.user_id,
          order_number: form.order_number,
          status: form.status,
          total_amount: parseFloat(form.total_amount),
          shipping_address,
        },
      ]);
      if (error) {
        setResult("Error: " + error.message);
      } else {
        setResult("Order created successfully!");
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
              <Input name="user_id" value={form.user_id} onChange={handleChange} required />
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
              <label>Total Amount</label>
              <Input name="total_amount" value={form.total_amount} onChange={handleChange} required type="number" step="0.01" />
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
