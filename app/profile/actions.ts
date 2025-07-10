"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string

    if (!firstName || !lastName) {
        return { error: "First name and last name are required" }
    }

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Not authenticated" }
        }

        const { error } = await supabase
            .from("Users")
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq("auth_id", user.id)

        if (error) {
            console.error("Profile update error:", error)
            return { error: "Failed to update profile" }
        }

        revalidatePath("/profile")
        return { success: "Profile updated successfully" }
    } catch (error) {
        console.error("Profile update error:", error)
        return { error: "Failed to update profile" }
    }
}

export async function updateNewsletterSubscription(formData: FormData) {
    const supabase = await createClient()

    const subscribeNewsletter = formData.get("subscribeNewsletter") === "true"

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Not authenticated" }
        }

        const { error } = await supabase
            .from("Users")
            .update({
                subscribe_newsletter: subscribeNewsletter,
            })
            .eq("auth_id", user.id)

        if (error) {
            console.error("Newsletter subscription update error:", error)
            return { error: "Failed to update newsletter subscription" }
        }

        revalidatePath("/profile")
        return { success: "Newsletter subscription updated successfully" }
    } catch (error) {
        console.error("Newsletter subscription update error:", error)
        return { error: "Failed to update newsletter subscription" }
    }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All password fields are required" }
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords don't match" }
    }

    if (newPassword.length < 6) {
        return { error: "New password must be at least 6 characters long" }
    }

    try {
        // First verify current password by attempting to sign in
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user?.email) {
            return { error: "Not authenticated" }
        }

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        })

        if (signInError) {
            return { error: "Current password is incorrect" }
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (updateError) {
            console.error("Password update error:", updateError)
            return { error: "Failed to update password" }
        }

        return { success: "Password updated successfully" }
    } catch (error) {
        console.error("Password update error:", error)
        return { error: "Failed to update password" }
    }
}
