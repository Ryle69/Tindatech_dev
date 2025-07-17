import { createClient } from "@/utils/supabase/server"

export async function refreshUserRole(userId: string) {
    const supabase = await createClient()

    // Force a fresh query without cache
    const { data: userProfile, error } = await supabase
        .from("Users")
        .select("role, first_name, last_name, email")
        .eq("auth_id", userId)
        .single()

    console.log("🔄 Fresh role query result:", { userProfile, error })
    return userProfile
}
