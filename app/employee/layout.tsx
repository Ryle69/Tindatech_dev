import type React from "react"
import EmpSidebar from "./components/emp-sidebar"
import {requireEmployee} from "@/utils/employee-middleware";

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    await requireEmployee()

    return (
        <div className="flex h-screen bg-gray-100">
            <EmpSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    )
}
