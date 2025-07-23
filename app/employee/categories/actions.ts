"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {cookies} from "next/headers";

export async function createCategory(formData: FormData) {
    const supabase = await createClient(cookies())

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    try {
        const { data, error } = await supabase
            .from("Categories")
            .insert({
                name,
                description,
                slug,
                is_active: isActive,
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath("/employee/categories")
        redirect("/employee/categories?success=Category created successfully")
    } catch (error: any) {
        console.error("Error creating category:", error)
        redirect(`/employee/categories/new?error=${encodeURIComponent(error.message)}`)
    }
}

export async function updateCategory(categoryId: number, formData: FormData) {
    const supabase = await createClient(cookies())

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    try {
        const { error } = await supabase
            .from("Categories")
            .update({
                name,
                description,
                slug,
                is_active: isActive,
                updated_at: new Date().toISOString(),
            })
            .eq("id", categoryId)

        if (error) throw error

        revalidatePath("/employee/categories")
        redirect("/employee/categories?success=Category updated successfully")
    } catch (error: any) {
        console.error("Error updating category:", error)
        redirect(`/employee/categories/${categoryId}/edit?error=${encodeURIComponent(error.message)}`)
    }
}

export async function deleteCategory(categoryId: number) {
    const supabase = await createClient(cookies())

    try {
        // Check if category has products
        const { data: products } = await supabase.from("Products").select("id").eq("category_id", categoryId).limit(1)

        if (products && products.length > 0) {
            redirect("/employee/categories?error=Cannot delete category with existing products")
            return
        }

        const { error } = await supabase.from("Categories").delete().eq("id", categoryId)

        if (error) throw error

        revalidatePath("/employee/categories")
        redirect("/employee/categories?success=Category deleted successfully")
    } catch (error: any) {
        console.error("Error deleting category:", error)
        redirect(`/employee/categories?error=${encodeURIComponent(error.message)}`)
    }
}

export async function toggleCategoryStatus(categoryId: number, isActive: boolean) {
    const supabase = await createClient(cookies())

    try {
        const { error } = await supabase
            .from("Categories")
            .update({ is_active: !isActive, updated_at: new Date().toISOString() })
            .eq("id", categoryId)

        if (error) throw error

        revalidatePath("/employee/categories")
    } catch (error: any) {
        console.error("Error toggling category status:", error)
    }
}
