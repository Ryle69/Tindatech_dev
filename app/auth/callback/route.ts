import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const next = searchParams.get("next") ?? "/"

    // Handle errors from Supabase
    if (error) {
        console.error("Auth callback error:", error, errorDescription)

        if (error === "access_denied" && errorDescription?.includes("expired")) {
            return NextResponse.redirect(
                `${origin}/register?message=Email confirmation link has expired. Please try registering again.`,
            )
        }

        return NextResponse.redirect(
            `${origin}/register?message=${encodeURIComponent(errorDescription || "Authentication failed")}`,
        )
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            console.log("✅ Email confirmation successful")

            // Get the user after session exchange
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                // Check user role for proper redirect
                const { data: userProfile, error: profileError } = await supabase
                    .from("Users")
                    .select("role")
                    .eq("auth_id", user.id)
                    .single()

                console.log("🔍 Callback Debug - User Profile:", { userProfile, profileError })

                if (userProfile?.role === "admin") {
                    console.log("🔄 Callback - Redirecting admin to /admin")
                    return NextResponse.redirect(`${origin}/admin`)
                } else {
                    console.log("🔄 Callback - Redirecting customer to /profile")
                    return NextResponse.redirect(`${origin}/profile`)
                }
            }

            // Fallback if no user profile found
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error("Session exchange error:", exchangeError)
        return NextResponse.redirect(`${origin}/register?message=${encodeURIComponent(exchangeError.message)}`)
    }

    // No code and no error - shouldn't happen
    return NextResponse.redirect(`${origin}/register?message=Invalid confirmation link`)
}
