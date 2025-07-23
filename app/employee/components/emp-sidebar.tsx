"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, BarChart3, Settings, LogOut, Crown, Folder, UserCog } from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { name: "Orders", href: "/employee/orders", icon: Package },
    { name: "Products", href: "/employee/products", icon: Package },
    { name: "Categories", href: "/employee/categories", icon: Folder },
    { name: "Customers", href: "/employee/customers", icon: Users },
]

export default function EmpSidebar() {
    const pathname = usePathname()

    async function handleSignOut() {
        const response = await fetch("/auth/signout", {
            method: "POST",
        })
        if (response.ok) {
            window.location.href = "/login"
        }
    }

    return (
        <div className="flex w-64 flex-col bg-gray-900">
            <div className="flex h-16 items-center justify-center bg-gray-800">
                <div className="flex items-center gap-2 text-white">
                    <Crown className="h-6 w-6" />
                    <span className="text-lg font-semibold">Employee Panel</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4">
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full gap-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}