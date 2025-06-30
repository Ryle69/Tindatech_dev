import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    // Now that RLS is disabled, we can query directly with regular client
    const { data: userProfile, error: profileError } = await supabase
        .from("Users")
        .select("role")
        .eq("auth_id", user.id)
        .single()

    console.log("🔍 Admin Check - User:", user.id, "Profile:", userProfile, "Error:", profileError)

    if (profileError || !userProfile || userProfile.role !== "admin") {
        console.log("❌ Admin check failed - redirecting to profile")
        redirect("/profile") // Redirect non-admins to their profile
    }

    console.log("✅ Admin check passed")
    return { user, userProfile }
}

export async function getAdminData() {
    const supabase = await createClient()

    // Get dashboard stats
    const [
        { count: totalProducts },
        { count: totalOrders },
        { count: totalCustomers },
        { data: recentOrders },
        { data: lowStockProducts },
    ] = await Promise.all([
        supabase.from("Products").select("*", { count: "exact", head: true }),
        supabase.from("Orders").select("*", { count: "exact", head: true }),
        supabase.from("Users").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase
            .from("Orders")
            .select("id, order_number, total_amount, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        supabase
            .from("Products")
            .select("id, name, inventory_quantity, low_stock_threshold")
            .lt("inventory_quantity", 10)
            .eq("track_inventory", true)
            .limit(5),
    ])

    return {
        stats: {
            totalProducts: totalProducts || 0,
            totalOrders: totalOrders || 0,
            totalCustomers: totalCustomers || 0,
        },
        recentOrders: recentOrders || [],
        lowStockProducts: lowStockProducts || [],
    }
}
