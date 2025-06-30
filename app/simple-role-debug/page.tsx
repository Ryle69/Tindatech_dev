import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function SimpleRoleDebugPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/login")
    }

    // Simple role query (RLS is now disabled)
    const { data: userProfile, error: profileError } = await supabase
        .from("Users")
        .select("role, email, auth_id")
        .eq("auth_id", user.id)
        .single()

    console.log("🔍 Simple Debug - Raw data:", userProfile)
    console.log("🔍 Simple Debug - Role value:", userProfile?.role)
    console.log("🔍 Simple Debug - Role type:", typeof userProfile?.role)

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Simple Role Debug (RLS Disabled)</h1>

            <div className="space-y-4">
                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Your Auth User</h2>
                    <p>ID: {user.id}</p>
                    <p>Email: {user.email}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Database Query Result</h2>
                    {profileError ? (
                        <p className="text-red-600">Error: {profileError.message}</p>
                    ) : userProfile ? (
                        <div className="space-y-2">
                            <p>
                                <strong>Email:</strong> {userProfile.email}
                            </p>
                            <p>
                                <strong>Auth ID:</strong> {userProfile.auth_id}
                            </p>
                            <p>
                                <strong>Role:</strong> "{String(userProfile.role)}"
                            </p>
                            <p>
                                <strong>Role Type:</strong> {typeof userProfile.role}
                            </p>
                            <p>
                                <strong>Role is null:</strong> {userProfile.role === null ? "YES" : "NO"}
                            </p>
                            <p>
                                <strong>Role is undefined:</strong> {userProfile.role === undefined ? "YES" : "NO"}
                            </p>
                            <p>
                                <strong>Role equals 'admin':</strong> {userProfile.role === "admin" ? "✅ YES" : "❌ NO"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-red-600">No profile found</p>
                    )}
                </div>

                <div className="bg-green-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Status</h2>
                    <p className="text-sm">✅ RLS is now disabled - queries should work without infinite recursion</p>
                </div>

                <div className="bg-yellow-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">Quick Fix</h2>
                    <p className="text-sm mb-2">If role is wrong, run this SQL in Supabase:</p>
                    <div className="bg-white p-2 rounded font-mono text-sm">
                        UPDATE public."Users" SET role = 'admin' WHERE auth_id = '{user.id}';
                    </div>
                </div>

                <div className="space-x-4">
                    <a href="/admin" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
                        Try Admin
                    </a>
                    <a href="/profile" className="inline-block bg-gray-600 text-white px-4 py-2 rounded">
                        Go to Profile
                    </a>
                </div>
            </div>
        </div>
    )
}
