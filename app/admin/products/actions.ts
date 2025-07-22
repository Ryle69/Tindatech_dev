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

        // Validate required fields
        if (!name || !price) {
            return {
                error: "Name and price are required",
                success: false
            }
        }

        // Handle image upload if provided
        let imageUrl = null
        const imageFile = formData.get("image") as File

        if (imageFile && imageFile.size > 0) {
            const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`
            const filePath = `${fileName}`

            // Upload the file
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            // Get the public URL - use this specific format
            imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`

            console.log('Image uploaded to:', imageUrl) // For debugging
        }

        // Process specifications
        const specifications: Record<string, string> = {}
        let index = 0
        while (formData.has(`specifications[${index}][name]`)) {
            const name = formData.get(`specifications[${index}][name]`) as string
            const value = formData.get(`specifications[${index}][value]`) as string
            if (name && value) {
                specifications[name] = value
            }
            index++
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

        // Create product in database
        const { error: insertError } = await supabase.from("Products").insert({
            name: formData.get("name") as string,
            sku: formData.get("sku") as string,
            description: formData.get("description") as string,
            specifications,
            slug,
            price: parseFloat(formData.get("price") as string),
            compare_price: formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null,
            cost_price: formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null,
            category_id: formData.get("categoryId") as string,
            inventory_quantity: parseInt(formData.get("inventoryQuantity") as string) || 0,
            low_stock_threshold: parseInt(formData.get("lowStockThreshold") as string) || 0,
            track_inventory: formData.get("trackInventory") === "on",
            is_active: formData.get("isActive") === "on",
            is_featured: formData.get("isFeatured") === "on",
            image: imageUrl,
            created_at: new Date().toISOString(),
        })

        if (insertError) {
            console.error('Insert error:', insertError)
            return {
                error: insertError.message,
                success: false
            }
        }

        return {
            success: true
        }
    } catch (error: any) {
        console.error('General error:', error)
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

        revalidatePath("/admin/products")
        redirect("/admin/products?success=Product updated successfully")
    } catch (error: any) {
        redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(error.message)}`)
    }
}

export async function deleteProduct(productId: number) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore) // Add await here

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
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

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
