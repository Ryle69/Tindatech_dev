"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { createServerClient } from "@supabase/ssr"

// Create service role client for server actions
function createServiceRoleClient() {
    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        cookies: {
            getAll() {
                return []
            },
            setAll() {},
        },
    })
}

export async function register(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const agreeToTerms = formData.get("agreeToTerms") === "on"
    const subscribeNewsletter = formData.get("subscribeNewsletter") === "on"

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
        redirect(`/register?message=Please fill in all required fields`)
    }

    if (!agreeToTerms) {
        redirect("/register?message=You must agree to the terms and conditions")
    }

    if (password !== confirmPassword) {
        redirect(`/register?message=Passwords don't match`)
    }

    if (password.length < 6) {
        redirect(`/register?message=Password must be at least 6 characters long`)
    }

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        })

        if (authError) {
            redirect(`/register?message=${encodeURIComponent(authError.message)}`)
        }

        if (authData.user) {
            const serviceRoleClient = createServiceRoleClient()

            const { error: profileError } = await serviceRoleClient.from("Users").insert({
                auth_id: authData.user.id,
                email: authData.user.email,
                first_name: firstName,
                last_name: lastName,
                role: "customer",
                subscribe_newsletter: subscribeNewsletter,
                created_at: new Date().toISOString(),
            })
        }

        if (authData.user && !authData.session) {
            redirect("/register/check-email")
        }

        if (authData.session && authData.user) {
            const serviceRoleClient = createServiceRoleClient()
            const { data: userProfile } = await serviceRoleClient
                .from("Users")
                .select("role")
                .eq("auth_id", authData.user.id)
                .single()

            if (userProfile?.role === "admin") {
                redirect("/admin")
            } else {
                redirect("/profile")
            }
        }
        redirect("/register/check-email")
    } catch (error: any) {
        if (error.message !== "NEXT_REDIRECT") {
            redirect(`/register?message=${encodeURIComponent(error.message || "Registration failed. Please try again.")}`)
        }
        throw error
    }
}
