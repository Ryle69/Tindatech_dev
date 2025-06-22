"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function register(formData: FormData) {
    const supabase = await createClient()

    // Get from front end
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        redirect(`/error?message=Email and password are required`)
    }

    // Sign up func
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // for email confirmation
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        console.error("Signup error:", error.message)
        redirect(`/error?message=${encodeURIComponent(error.message)}`) // Fixed the double equals
    }

    if (data.user && !data.session) {
        redirect("/register/check-email")
    }

    // successful account creation
    revalidatePath("/", "layout")
    redirect("/dashboard")
}
