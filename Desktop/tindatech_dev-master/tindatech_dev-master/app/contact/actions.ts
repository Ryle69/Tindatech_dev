'use server'

import { createClient } from "@/utils/supabase/server"
import { z } from "zod"
import { cookies } from "next/headers"

const ContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(1, "Message is required"),
})

interface FormState {
    success: boolean
    message: string
    errors?: {
        name?: string[]
        email?: string[]
        message?: string[]
    }
}

export async function submitContactForm(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Form validation
    const validatedFields = ContactSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Please fill all required fields",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        const { error } = await supabase
            .from("contact_submissions") // Note: using lowercase table name
            .insert({
                name: validatedFields.data.name,
                email: validatedFields.data.email,
                message: validatedFields.data.message,
            })

        if (error) {
            console.error("Supabase error details:", error)
            throw new Error("Failed to save your message. Please try again.")
        }

        return {
            success: true,
            message: "Your message has been sent successfully! We'll get back to you soon.",
            errors: undefined,
        }
    } catch (error: any) {
        console.error("Contact form submission error:", error)
        return {
            success: false,
            message: error.message || "Failed to send message. Please try again later.",
            errors: undefined,
        }
    }
}