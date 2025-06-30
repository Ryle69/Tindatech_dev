"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Get from front end: Make sure fields aren't empty
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("🔍 Login Debug - Attempting login for:", email)

    if (!email || !password) {
        redirect(`/error?message=Email and password are required`)
    }

    const loginData = {
        email: email,
        password: password,
    }

    const { data, error } = await supabase.auth.signInWithPassword(loginData)

    if (error) {
        console.error("❌ Login error:", error.message)
        redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    console.log("✅ Login successful:", data.user?.email, "User ID:", data.user?.id)

    if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
            .from("Users")
            .select("role, first_name, last_name")
            .eq("auth_id", data.user.id)
            .single()

        console.log("🔍 Login Debug - Profile Query Result:", { userProfile, profileError })

        revalidatePath("/", "layout")

        if (userProfile?.role === "admin") {
            console.log("🔄 Login - Redirecting admin to /admin")
            redirect("/admin") // Redirect admins to admin panel
        } else {
            console.log("🔄 Login - Redirecting customer to /profile")
            redirect("/profile") // Redirect customers to profile
        }
    } else {
        console.error("❌ Login successful but user data not available")
        redirect("/error?message=Login successful but user data not available")
    }
}
