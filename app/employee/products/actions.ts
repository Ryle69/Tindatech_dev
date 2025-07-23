"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {cookies} from "next/headers";

interface FormState {
    error?: string;
    success?: boolean;
}

export async function createProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

    try {
        // Extract form data
        const name = formData.get("name") as string
        const sku = formData.get("sku") as string
        const description = formData.get("description") as string
        const price = parseFloat(formData.get("price") as string)
        const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null
        const costPrice = formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null
        const categoryId = formData.get("categoryId") as string
        const inventoryQuantity = parseInt(formData.get("inventoryQuantity") as string) || 0
        const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 0
        const trackInventory = formData.get("trackInventory") === "on"
        const isActive = formData.get("isActive") === "on"
        const isFeatured = formData.get("isFeatured") === "on"
        const imageFile = formData.get("image") as File

        // Validate required fields
        if (!name || !price) {
            return {
                error: "Name and price are required",
                success: false
            }
        }

        // Handle image upload if provided
        let imageUrl = null
        if (imageFile && imageFile.size > 0) {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("products")
                .upload(`products/${Date.now()}-${imageFile.name}`, imageFile)

            if (uploadError) {
                return {
                    error: "Failed to upload image",
                    success: false
                }
            }

            imageUrl = uploadData.path
        }

        // Create product in database
        const { error: insertError } = await supabase.from("Products").insert({
            name,
            sku,
            description,
            price,
            compare_price: comparePrice,
            cost_price: costPrice,
            category_id: categoryId,
            inventory_quantity: inventoryQuantity,
            low_stock_threshold: lowStockThreshold,
            track_inventory: trackInventory,
            is_active: isActive,
            is_featured: isFeatured,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
        })

        if (insertError) {
            return {
                error: insertError.message,
                success: false
            }
        }

        return {
            success: true
        }
    } catch (error: any) {
        return {
            error: error.message || "Failed to create product",
            success: false
        }
    }
}
export async function updateProduct(productId: number, formData: FormData) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

    const name = formData.get("name") as string
    const image = formData.get("image") as string
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
                image,
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

        revalidatePath("/employee/products")
        redirect("/employee/products?success=Product updated successfully")
    } catch (error: any) {
        redirect(`/employee/products/${productId}/edit?error=${encodeURIComponent(error.message)}`)
    }
}

export async function deleteProduct(productId: number) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

    try {
        const { error } = await supabase.from("Products").delete().eq("id", productId)

        if (error) throw error

        revalidatePath("/employee/products")
        redirect("/employee/products?success=Product deleted successfully")
    } catch (error: any) {
        redirect(`/employee/products?error=${encodeURIComponent(error.message)}`)
    }
}

export async function toggleProductStatus(productId: number, isActive: boolean) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

    try {
        const { error } = await supabase
            .from("Products")
            .update({ is_active: !isActive, updated_at: new Date().toISOString() })
            .eq("id", productId)

        if (error) throw error

        revalidatePath("/employee/products")
    } catch (error: any) {
    }
}
