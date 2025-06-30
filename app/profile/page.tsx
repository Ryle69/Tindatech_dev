import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./profile-client"

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    // Fetch user profile from your Users table
    let userProfile = null
    try {
        const { data: profile } = await supabase.from("Users").select("*").eq("auth_id", user.id).single()

        userProfile = profile
    } catch (error) {
        console.log("Could not fetch user profile:", error)
    }

    return <ProfileClient user={user} userProfile={userProfile} />
}
