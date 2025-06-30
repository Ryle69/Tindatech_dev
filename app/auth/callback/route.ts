import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const next = searchParams.get("next") ?? "/"

    if (error) {
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
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: userProfile, error: profileError } = await supabase
                    .from("Users")
                    .select("role")
                    .eq("auth_id", user.id)
                    .single()
                if (userProfile?.role === "admin") {
                    return NextResponse.redirect(`${origin}/admin`)
                } else {
                    return NextResponse.redirect(`${origin}/profile`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }

        return NextResponse.redirect(`${origin}/register?message=${encodeURIComponent(exchangeError.message)}`)
    }

    return NextResponse.redirect(`${origin}/register?message=Invalid confirmation link`)
}
