import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        },
    )

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This refreshes the user's session and is critical for session persistence
    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log("🔍 Middleware Debug - User:", user?.id, user?.email)

    // Get user role from Users table (RLS is now disabled)
    let userRole = null
    if (user) {
        try {
            const { data: userProfile, error } = await supabase.from("Users").select("role").eq("auth_id", user.id).single()

            console.log("🔍 Middleware Debug - Profile Query:", { userProfile, error, timestamp: new Date().toISOString() })
            userRole = userProfile?.role
        } catch (error) {
            console.log("❌ Could not fetch user role:", error)
        }
    }

    const isAdmin = userRole === "admin"
    console.log("🔍 Middleware Debug - Role Check:", { userRole, isAdmin, path: request.nextUrl.pathname })

    // Define public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/register/check-email",
        "/register/success",
        "/signup",
        "/signup/check-email",
        "/signup/success",
        "/signup/create-test-user",
        "/auth/callback",
        "/auth/confirm",
        "/error",
        "/terms",
        "/privacy",
        "/test-form",
        "/debug-user",
        "/refresh-role",
        "/check-role",
        "/debug-profile",
        "/debug-role-query",
        "/simple-role-debug",
        "/admin-test",
    ]

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some((route) => {
        if (route === "/") return request.nextUrl.pathname === "/"
        return request.nextUrl.pathname.startsWith(route)
    })

    // Check if trying to access admin routes
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

    console.log("🔍 Middleware Debug - Route Check:", {
        isPublicRoute,
        isAdminRoute,
        currentPath: request.nextUrl.pathname,
    })

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
        console.log(`🔄 Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`)
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // If user is authenticated but not admin and trying to access admin routes
    if (user && isAdminRoute && !isAdmin) {
        console.log(`🔄 Redirecting non-admin user from ${request.nextUrl.pathname} to /profile`)
        console.log(`🔍 User details: ID=${user.id}, Role=${userRole}, IsAdmin=${isAdmin}`)
        const url = request.nextUrl.clone()
        url.pathname = "/profile"
        return NextResponse.redirect(url)
    }

// If user is authenticated and trying to access login/register pages
    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
        console.log(`🔄 Redirecting authenticated user from ${request.nextUrl.pathname}`)
        console.log(`🔍 User role: ${userRole}, IsAdmin: ${isAdmin}`)
        const returnUrl = request.nextUrl.searchParams.get("returnUrl")

        if (returnUrl) {
            console.log(`🔄 Redirecting to returnUrl: ${returnUrl}`)
            return NextResponse.redirect(new URL(returnUrl, request.url))
        }

        const url = request.nextUrl.clone()
        // Redirect based on role
        if (isAdmin) {
            console.log("🔄 Redirecting admin to /admin")
            url.pathname = "/admin"
        } else {
            console.log("🔄 Redirecting customer to /profile")
            url.pathname = "/profile"
        }
        return NextResponse.redirect(url)
    }

    console.log("✅ Middleware - No redirect needed")
    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // This ensures cookies are properly set for session persistence
    return supabaseResponse
}
