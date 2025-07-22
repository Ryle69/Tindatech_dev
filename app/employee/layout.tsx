import type React from "react"
import { requireAdmin } from "@/utils/admin-middleware"
import EmpSidebar from "./components/emp-sidebar"

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="flex h-screen bg-gray-100">
            <EmpSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    )
}
