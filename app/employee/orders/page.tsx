import { createClient } from "@/utils/supabase/server"
import OrdersClient from "./OrdersClient";
import {cookies} from "next/headers";
import {requireEmployee} from "@/utils/employee-middleware";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  await requireEmployee();
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const searchTerm = searchParams.search || "";
  const statusFilter = searchParams.status || "";

  let query = supabase.from("Orders").select("*").order("created_at", { ascending: false });

  if (searchTerm) {
    query = query.or(`order_number.ilike.%${searchTerm}%`);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: orders } = await query;

  return (
    <>
      <OrdersClient 
        orders={orders || []}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </>
  );
}
