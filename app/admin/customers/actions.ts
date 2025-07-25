"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {cookies} from "next/headers";

export async function updateCustomer(customerId: number, formData: FormData) {
    const supabase = await createClient(cookies())

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const subscribeNewsletter = formData.get("subscribeNewsletter") === "on"

    try {
        const { error } = await supabase
            .from("Users")
            .update({
                first_name: firstName,
                last_name: lastName,
                email,
                subscribe_newsletter: subscribeNewsletter,
                updated_at: new Date().toISOString(),
            })
            .eq("id", customerId)

        if (error) throw error

        revalidatePath("/admin/customers")
        redirect("/admin/customers?success=Customer updated successfully")
    } catch (error: any) {
        console.error("Error updating customer:", error)
        redirect(`/admin/customers/${customerId}/edit?error=${encodeURIComponent(error.message)}`)
    }
}

export async function deleteCustomer(customerId: number) {
    const supabase = await createClient(cookies())

    try {
        const { error } = await supabase.from("Users").delete().eq("id", customerId).eq("role", "customer")

        if (error) throw error

        revalidatePath("/admin/customers")
        redirect("/admin/customers?success=Customer deleted successfully")
    } catch (error: any) {
        console.error("Error deleting customer:", error)
        redirect(`/admin/customers?error=${encodeURIComponent(error.message)}`)
    }
}
