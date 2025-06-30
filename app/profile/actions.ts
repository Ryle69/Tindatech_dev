"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/login")
    }

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string

    if (!firstName || !lastName) {
        redirect("/profile?error=First name and last name are required")
    }

    try {
        const { error } = await supabase
            .from("Users")
            .update({
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString(),
            })
            .eq("auth_id", user.id)

        if (error) throw error

        revalidatePath("/profile")
        redirect("/profile?success=Profile updated successfully")
    } catch (error: any) {
        console.error("Error updating profile:", error)
        redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }
}

export async function updateNewsletterSubscription(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/login")
    }

    const subscribeNewsletter = formData.get("subscribeNewsletter") === "on"

    try {
        const { error } = await supabase
            .from("Users")
            .update({
                subscribe_newsletter: subscribeNewsletter,
                updated_at: new Date().toISOString(),
            })
            .eq("auth_id", user.id)

        if (error) throw error

        revalidatePath("/profile")
        redirect("/profile?success=Newsletter subscription updated successfully")
    } catch (error: any) {
        console.error("Error updating newsletter subscription:", error)
        redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/login")
    }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        redirect("/profile?error=All password fields are required")
    }

    if (newPassword !== confirmPassword) {
        redirect("/profile?error=New passwords do not match")
    }

    if (newPassword.length < 6) {
        redirect("/profile?error=New password must be at least 6 characters long")
    }

    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (error) throw error

        revalidatePath("/profile")
        redirect("/profile?success=Password updated successfully")
    } catch (error: any) {
        console.error("Error updating password:", error)
        redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }
}
