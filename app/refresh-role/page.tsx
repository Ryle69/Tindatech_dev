import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function forceRefresh() {
    "use server"

    // Revalidate all paths to clear cache
    revalidatePath("/", "layout")

    // Sign out to force fresh session
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login?message=Please log in again to refresh your role")
}

async function refreshData() {
    "use server"

    // Just revalidate without signing out
    revalidatePath("/", "layout")
    redirect("/refresh-role?refreshed=true")
}

export default async function RefreshRolePage({
                                                  searchParams,
                                              }: {
    searchParams: { refreshed?: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    // Force fresh query
    const { data: userProfile, error: profileError } = await supabase
        .from("Users")
        .select("*")
        .eq("auth_id", user.id)
        .single()

    const wasRefreshed = searchParams.refreshed === "true"

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Role Refresh</h1>

            {wasRefreshed && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    ✅ Data refreshed! Check your role status below.
                </div>
            )}

            <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Current User Data:</h2>
                    <pre className="text-sm">{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
                </div>

                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Current Profile Data:</h2>
                    <pre className="text-sm">{JSON.stringify(userProfile, null, 2)}</pre>
                    {profileError && <p className="text-red-600 mt-2">Error: {profileError.message}</p>}
                </div>

                <div className="bg-green-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Role Status:</h2>
                    <p>
                        <strong>Role:</strong> {userProfile?.role || "Not found"}
                    </p>
                    <p>
                        <strong>Is Admin:</strong> {user?.role === "admin" ? "✅ YES" : "❌ NO"}
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Actions:</h3>
                    <div className="space-x-4 space-y-2">
                        <a href="/admin" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Try Admin Panel
                        </a>
                        <a href="/profile" className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                            Go to Profile
                        </a>

                        <form action={refreshData} className="inline">
                            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                                Refresh Data Only
                            </button>
                        </form>

                        <form action={forceRefresh} className="inline">
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                Force Sign Out & Refresh
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-yellow-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Manual Steps if Still Not Working:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Open browser dev tools (F12)</li>
                        <li>Go to Application/Storage tab</li>
                        <li>Clear all cookies for this site</li>
                        <li>Clear localStorage and sessionStorage</li>
                        <li>Hard refresh (Ctrl+Shift+R)</li>
                        <li>Log in again</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
