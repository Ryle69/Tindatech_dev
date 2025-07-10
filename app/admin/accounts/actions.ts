"use server"

import { createClient } from "@/utils/supabase/server"
import { createServerClient } from "@supabase/ssr"

// Create service role client for admin actions
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

export async function createEmployeeAccount(formData: FormData) {
    const supabase = await createClient()

    // Check if current user is admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: userProfile } = await supabase.from("Users").select("role").eq("auth_id", user.id).single()

    if (userProfile?.role !== "admin") {
        return { error: "Not authorized" }
    }

    // Extract form data
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const role = "employee" // Force role to be employee
    const password = formData.get("password") as string

    if (!firstName || !lastName || !email || !password) {
        return { error: "All fields are required" }
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters long" }
    }

    try {
        const serviceRoleClient = createServiceRoleClient()

        // Check if email already exists
        const { data: existingUsers, error: listError } = await serviceRoleClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        })

        if (listError) {
            console.error("Error checking existing users:", listError)
            return { error: "Failed to check existing users" }
        }

        const userExists = existingUsers.users.some(user => user.email === email)
        if (userExists) {
            return { error: "Email already exists" }
        }

        // Create user with admin API
        const { data: authData, error: authError } = await serviceRoleClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
            },
        })

        if (authError) {
            console.error("Auth user creation error:", authError)
            return { error: authError.message }
        }

        // Create user profile in database with enforced employee role
        if (authData.user) {
            const { error: profileError } = await serviceRoleClient.from("Users").insert({
                auth_id: authData.user.id,
                email: authData.user.email,
                first_name: firstName,
                last_name: lastName,
                role: "employee", // Enforced role
                subscribe_newsletter: false,
                created_at: new Date().toISOString(),
            })

            if (profileError) {
                console.error("User profile creation error:", profileError)
                await serviceRoleClient.auth.admin.deleteUser(authData.user.id)
                return { error: "Failed to create user profile" }
            }
        }

        return { success: "Employee account created successfully" }
    } catch (error: any) {
        console.error("Employee account creation error:", error)
        return { error: error.message || "Failed to create employee account" }
    }
}

export async function updateEmployeeAccount(userId: string, formData: FormData) {
    const supabase = await createClient()

    // Check if current user is admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: userProfile } = await supabase.from("Users").select("role").eq("auth_id", user.id).single()

    if (userProfile?.role !== "admin") {
        return { error: "Not authorized" }
    }

    // Extract form data
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const role = formData.get("role") as string

    if (!firstName || !lastName || !role) {
        return { error: "All fields are required" }
    }

    try {
        const serviceRoleClient = createServiceRoleClient()

        // Update user profile in database
        const { error: profileError } = await serviceRoleClient
            .from("Users")
            .update({
                first_name: firstName,
                last_name: lastName,
                role: role.toLowerCase(),
                updated_at: new Date().toISOString(),
            })
            .eq("auth_id", userId)

        if (profileError) {
            console.error("User profile update error:", profileError)
            return { error: "Failed to update user profile" }
        }

        // Update auth user metadata if needed
        await serviceRoleClient.auth.admin.updateUserById(userId, {
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
            },
        })

        return { success: "Employee account updated successfully" }
    } catch (error: any) {
        console.error("Employee account update error:", error)
        return { error: error.message || "Failed to update employee account" }
    }
}

export async function deleteEmployeeAccount(userId: string) {
    const supabase = await createClient()

    // Check if current user is admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: userProfile } = await supabase.from("Users").select("role").eq("auth_id", user.id).single()

    if (userProfile?.role !== "admin") {
        return { error: "Not authorized" }
    }

    try {
        const serviceRoleClient = createServiceRoleClient()

        // First delete the profile from database
        const { error: profileError } = await serviceRoleClient
            .from("Users")
            .delete()
            .eq("auth_id", userId)

        if (profileError) {
            console.error("User profile deletion error:", profileError)
            return { error: "Failed to delete user profile" }
        }

        // Then delete the auth user
        const { error: authError } = await serviceRoleClient.auth.admin.deleteUser(userId)

        if (authError) {
            console.error("Auth user deletion error:", authError)
            return { error: authError.message }
        }

        return { success: "Employee account deleted successfully" }
    } catch (error: any) {
        console.error("Employee account deletion error:", error)
        return { error: error.message || "Failed to delete employee account" }
    }
}

export async function getEmployeeAccounts() {
    const supabase = await createClient()

    // Check if current user is admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated", data: null }
    }

    const { data: userProfile } = await supabase.from("Users").select("role").eq("auth_id", user.id).single()

    if (userProfile?.role !== "admin") {
        return { error: "Not authorized", data: null }
    }

    try {
        const { data: employees, error } = await supabase
            .from("Users")
            .select("*")
            .eq("role", "employee") // Only get users with employee role
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching employees:", error)
            return { error: "Failed to fetch employees", data: null }
        }

        return { data: employees, error: null }
    } catch (error: any) {
        console.error("Error fetching employees:", error)
        return { error: error.message || "Failed to fetch employees", data: null }
    }
}