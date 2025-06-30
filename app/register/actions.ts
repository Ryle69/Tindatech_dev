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

    // Extract form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const agreeToTerms = formData.get("agreeToTerms") === "on"
    const subscribeNewsletter = formData.get("subscribeNewsletter") === "on"

    console.log("Customer registration attempt:", {
        email,
        firstName,
        lastName,
        agreeToTerms,
        subscribeNewsletter,
        passwordLength: password?.length,
        confirmPasswordLength: confirmPassword?.length,
    })

    // Validation
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
        console.log("Missing required fields")
        redirect(`/register?message=Please fill in all required fields`)
    }

    if (!agreeToTerms) {
        console.log("Terms not agreed")
        redirect("/register?message=You must agree to the terms and conditions")
    }

    if (password !== confirmPassword) {
        console.log("Passwords don't match")
        redirect(`/register?message=Passwords don't match`)
    }

    if (password.length < 6) {
        console.log("Password too short")
        redirect(`/register?message=Password must be at least 6 characters long`)
    }

    try {
        console.log("Starting customer registration...")

        // 1. Sign up user with Supabase Auth
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
            console.error("Auth signup error:", authError)
            redirect(`/register?message=${encodeURIComponent(authError.message)}`)
        }

        console.log("Auth signup successful:", authData.user?.id)

        // 2. Create customer profile in database (role defaults to 'customer')
        if (authData.user) {
            console.log("Creating customer profile...")

            const serviceRoleClient = createServiceRoleClient()

            const { error: profileError } = await serviceRoleClient.from("Users").insert({
                auth_id: authData.user.id,
                email: authData.user.email,
                first_name: firstName,
                last_name: lastName,
                role: "customer", // Explicitly set as customer
                subscribe_newsletter: subscribeNewsletter,
                created_at: new Date().toISOString(),
            })

            if (profileError) {
                console.error("Customer profile creation error:", profileError)
                // Don't fail registration if profile creation fails
                console.log("Customer created in auth but profile creation failed")
            } else {
                console.log("Customer profile created successfully")
            }
        }

        // 3. Handle redirection based on email confirmation settings
        if (authData.user && !authData.session) {
            console.log("Email confirmation required - redirecting to check email")
            redirect("/register/check-email")
        }

        if (authData.session && authData.user) {
            console.log("Customer logged in immediately - checking role for redirect")

            // Check user role for proper redirect
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

        // Fallback - this should not happen but just in case
        console.log("Unexpected state - redirecting to check email")
        redirect("/register/check-email")
    } catch (error: any) {
        // Only log actual errors, not redirect "errors"
        if (error.message !== "NEXT_REDIRECT") {
            console.error("Actual registration error:", error)
            redirect(`/register?message=${encodeURIComponent(error.message || "Registration failed. Please try again.")}`)
        }
        // If it's a NEXT_REDIRECT, just re-throw it to let Next.js handle it
        throw error
    }
}
