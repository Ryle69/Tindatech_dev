import { createClient } from "@/utils/supabase/client";

export async function fetchOrders(userId: string) {
  if (!userId) throw new Error("Authentication required");
  const supabase = createClient();

    const { data, error } = await supabase
        .from("Orders")
        .select(`
      *,
      Reviews!Orders_review_fkey (
        id,
        rating,
        review,
        created_at
      ),
      OrderItems!OrderItems_order_id_fkey (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}
