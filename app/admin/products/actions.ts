"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const comparePrice = formData.get("comparePrice") ? Number.parseFloat(formData.get("comparePrice") as string) : null
    const costPrice = formData.get("costPrice") ? Number.parseFloat(formData.get("costPrice") as string) : null
    const sku = formData.get("sku") as string
    const categoryId = formData.get("categoryId") ? Number.parseInt(formData.get("categoryId") as string) : null
    const inventoryQuantity = Number.parseInt(formData.get("inventoryQuantity") as string) || 0
    const lowStockThreshold = Number.parseInt(formData.get("lowStockThreshold") as string) || 10
    const trackInventory = formData.get("trackInventory") === "on"
    const isActive = formData.get("isActive") === "on"
    const isFeatured = formData.get("isFeatured") === "on"

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    try {
        const { data, error } = await supabase
            .from("Products")
            .insert({
                name,
                description,
                slug,
                price,
                compare_price: comparePrice,
                cost_price: costPrice,
                sku,
                category_id: categoryId,
                inventory_quantity: inventoryQuantity,
                low_stock_threshold: lowStockThreshold,
                track_inventory: trackInventory,
                is_active: isActive,
                is_featured: isFeatured,
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath("/admin/products")
        redirect("/admin/products?success=Product created successfully")
    } catch (error: any) {
        redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`)
    }
}

export async function updateProduct(productId: number, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const comparePrice = formData.get("comparePrice") ? Number.parseFloat(formData.get("comparePrice") as string) : null
    const costPrice = formData.get("costPrice") ? Number.parseFloat(formData.get("costPrice") as string) : null
    const sku = formData.get("sku") as string
    const categoryId = formData.get("categoryId") ? Number.parseInt(formData.get("categoryId") as string) : null
    const inventoryQuantity = Number.parseInt(formData.get("inventoryQuantity") as string) || 0
    const lowStockThreshold = Number.parseInt(formData.get("lowStockThreshold") as string) || 10
    const trackInventory = formData.get("trackInventory") === "on"
    const isActive = formData.get("isActive") === "on"
    const isFeatured = formData.get("isFeatured") === "on"

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    try {
        const { error } = await supabase
            .from("Products")
            .update({
                name,
                description,
                slug,
                price,
                compare_price: comparePrice,
                cost_price: costPrice,
                sku,
                category_id: categoryId,
                inventory_quantity: inventoryQuantity,
                low_stock_threshold: lowStockThreshold,
                track_inventory: trackInventory,
                is_active: isActive,
                is_featured: isFeatured,
                updated_at: new Date().toISOString(),
            })
            .eq("id", productId)

        if (error) throw error

        revalidatePath("/admin/products")
        redirect("/admin/products?success=Product updated successfully")
    } catch (error: any) {
        redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(error.message)}`)
    }
}

export async function deleteProduct(productId: number) {
    const supabase = await createClient()

    try {
        const { error } = await supabase.from("Products").delete().eq("id", productId)

        if (error) throw error

        revalidatePath("/admin/products")
        redirect("/admin/products?success=Product deleted successfully")
    } catch (error: any) {
        redirect(`/admin/products?error=${encodeURIComponent(error.message)}`)
    }
}

export async function toggleProductStatus(productId: number, isActive: boolean) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from("Products")
            .update({ is_active: !isActive, updated_at: new Date().toISOString() })
            .eq("id", productId)

        if (error) throw error

        revalidatePath("/admin/products")
    } catch (error: any) {
    }
}
