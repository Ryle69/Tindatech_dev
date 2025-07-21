import type React from "react"
import { requireAdmin } from "@/utils/admin-middleware"
import AdminSidebar from "./components/admin-sidebar"

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    )
}
