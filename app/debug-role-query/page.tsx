import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DebugRoleQueryPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/login")
    }

    // Test different ways to query the role
    console.log("🔍 Testing role queries for user:", user.id)

    // Query 1: Select everything
    const { data: fullProfile, error: fullError } = await supabase
        .from("Users")
        .select("*")
        .eq("auth_id", user.id)
        .single()

    // Query 2: Select only role
    const { data: roleOnly, error: roleError } = await supabase
        .from("Users")
        .select("role")
        .eq("auth_id", user.id)
        .single()

    // Query 3: Raw SQL-like query
    const { data: rawQuery, error: rawError } = await supabase
        .from("Users")
        .select("auth_id, email, role")
        .eq("auth_id", user.id)

    // Query 4: Check if role column exists and has data
    const { data: allRoles, error: allRolesError } = await supabase
        .from("Users")
        .select("id, email, role")
        .not("role", "is", null)

    // Query 5: Check exact role values
    const { data: adminUsers, error: adminError } = await supabase.from("Users").select("*").eq("role", "admin")

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Role Query Debug</h1>

            <div className="space-y-6">
                {/* Auth User */}
                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Auth User</h2>
                    <p>
                        <strong>ID:</strong> {user.id}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>

                {/* Full Profile Query */}
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Query 1: Full Profile</h2>
                    {fullError ? (
                        <p className="text-red-600">❌ Error: {fullError.message}</p>
                    ) : (
                        <div>
                            <pre className="text-sm bg-white p-2 rounded">{JSON.stringify(fullProfile, null, 2)}</pre>
                            <div className="mt-2 text-sm">
                                <p>
                                    <strong>Role Value:</strong> "{fullProfile?.role}"
                                </p>
                                <p>
                                    <strong>Role Type:</strong> {typeof fullProfile?.role}
                                </p>
                                <p>
                                    <strong>Role Length:</strong> {fullProfile?.role?.length || 0}
                                </p>
                                <p>
                                    <strong>Is Admin:</strong> {fullProfile?.role === "admin" ? "✅ YES" : "❌ NO"}
                                </p>
                                <p>
                                    <strong>Strict Equality:</strong> {fullProfile?.role === "admin" ? "true" : "false"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Role Only Query */}
                <div className="bg-yellow-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Query 2: Role Only</h2>
                    {roleError ? (
                        <p className="text-red-600">❌ Error: {roleError.message}</p>
                    ) : (
                        <div>
                            <pre className="text-sm bg-white p-2 rounded">{JSON.stringify(roleOnly, null, 2)}</pre>
                            <p className="text-sm mt-2">
                                <strong>Role:</strong> "{roleOnly?.role}" (Type: {typeof roleOnly?.role})
                            </p>
                        </div>
                    )}
                </div>

                {/* Raw Query */}
                <div className="bg-green-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Query 3: Raw Query (Array Result)</h2>
                    {rawError ? (
                        <p className="text-red-600">❌ Error: {rawError.message}</p>
                    ) : (
                        <div>
                            <pre className="text-sm bg-white p-2 rounded">{JSON.stringify(rawQuery, null, 2)}</pre>
                            <p className="text-sm mt-2">
                                <strong>Found Records:</strong> {rawQuery?.length || 0}
                            </p>
                            {rawQuery && rawQuery.length > 0 && (
                                <p className="text-sm">
                                    <strong>First Record Role:</strong> "{rawQuery[0].role}"
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* All Roles */}
                <div className="bg-purple-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Query 4: All Users with Roles</h2>
                    {allRolesError ? (
                        <p className="text-red-600">❌ Error: {allRolesError.message}</p>
                    ) : (
                        <div>
                            <p className="text-sm mb-2">
                                <strong>Users with roles:</strong> {allRoles?.length || 0}
                            </p>
                            <pre className="text-sm bg-white p-2 rounded">{JSON.stringify(allRoles, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Admin Users */}
                <div className="bg-red-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Query 5: Users with role = 'admin'</h2>
                    {adminError ? (
                        <p className="text-red-600">❌ Error: {adminError.message}</p>
                    ) : (
                        <div>
                            <p className="text-sm mb-2">
                                <strong>Admin users found:</strong> {adminUsers?.length || 0}
                            </p>
                            <pre className="text-sm bg-white p-2 rounded">{JSON.stringify(adminUsers, null, 2)}</pre>
                            {adminUsers && adminUsers.length > 0 && (
                                <div className="mt-2">
                                    {adminUsers.map((admin, index) => (
                                        <p key={index} className="text-sm">
                                            <strong>Admin {index + 1}:</strong> {admin.email} (auth_id: {admin.auth_id})
                                            {admin.auth_id === user.id && " ← This is you!"}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Character Analysis */}
                <div className="bg-orange-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Character Analysis</h2>
                    {fullProfile?.role && typeof fullProfile.role === "string" ? (
                        <div className="text-sm space-y-1">
                            <p>
                                <strong>Role String:</strong> "{fullProfile.role}"
                            </p>
                            <p>
                                <strong>Character Codes:</strong> [
                                {Array.from(fullProfile.role as string)
                                    .map((char: string) => char.charCodeAt(0))
                                    .join(", ")}
                                ]
                            </p>
                            <p>
                                <strong>Trimmed:</strong> "{(fullProfile.role as string).trim()}"
                            </p>
                            <p>
                                <strong>Lowercase:</strong> "{(fullProfile.role as string).toLowerCase()}"
                            </p>
                            <p>
                                <strong>Includes 'admin':</strong> {(fullProfile.role as string).includes("admin") ? "✅ YES" : "❌ NO"}
                            </p>
                            <p>
                                <strong>Starts with 'admin':</strong>{" "}
                                {(fullProfile.role as string).startsWith("admin") ? "✅ YES" : "❌ NO"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-red-600">Role is not a string or is null/undefined</p>
                    )}
                </div>

                {/* Test Different Comparisons */}
                <div className="bg-pink-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Comparison Tests</h2>
                    {fullProfile?.role && typeof fullProfile.role === "string" ? (
                        <div className="text-sm space-y-1">
                            <p>
                                <strong>role === 'admin':</strong> {fullProfile.role === "admin" ? "✅ true" : "❌ false"}
                            </p>
                            <p>
                                <strong>role == 'admin':</strong> {fullProfile.role == "admin" ? "✅ true" : "❌ false"}
                            </p>
                            <p>
                                <strong>role.trim() === 'admin':</strong>{" "}
                                {(fullProfile.role as string).trim() === "admin" ? "✅ true" : "❌ false"}
                            </p>
                            <p>
                                <strong>role.toLowerCase() === 'admin':</strong>{" "}
                                {(fullProfile.role as string).toLowerCase() === "admin" ? "✅ true" : "❌ false"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-red-600">Role is not a string - Type: {typeof fullProfile?.role}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
