import { createClient } from "@/utils/supabase/client";

export async function fetchOrders(userId: string) {
  if (!userId) throw new Error("No userId provided to fetchOrders");
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Orders")
    .select("*")
    // .eq("user_id", userId) // TEMPORARILY REMOVED FOR DEBUGGING
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
