'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Get from front end: Make sure fields aren't empty
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect(`/error?message=Email and password are required`)
    }

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const loginData = {
        email: email,
        password: password,
    }

    const { data, error } = await supabase.auth.signInWithPassword(loginData)

    if (error) {
        console.error("Login error:", error.message)
        redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    // login successful
    console.log("Login successful:", data.user?.email)
    revalidatePath('/', 'layout')
    redirect('/profile')
}
