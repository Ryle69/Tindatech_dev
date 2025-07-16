import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {cookies} from "next/headers";

export async function POST() {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error("Error signing out:", error.message)
        redirect("/error?message=Error signing out")
    }

    revalidatePath("/", "layout")
    redirect("/login")
}
