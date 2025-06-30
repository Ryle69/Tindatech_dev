"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Package, ShoppingBag, Star, TrendingUp, Users, LogOut, Crown, Save, Eye, EyeOff } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { updateProfile, updateNewsletterSubscription, updatePassword } from "./actions"

interface UserProfile {
    id: number
    auth_id: string
    email: string
    first_name: string
    last_name: string
    role: "admin" | "customer"
    subscribe_newsletter: boolean
    created_at: string
}

interface ProfileClientProps {
    user: User
    userProfile: UserProfile | null
    searchParams?: { success?: string; error?: string }
}

export default function ProfileClient({ user, userProfile, searchParams }: ProfileClientProps) {
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const userRole = userProfile?.role || "customer"
    const isAdmin = userRole === "admin"

    const displayName = userProfile
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : user.email?.split("@")[0] || "User"

    const joinDate = userProfile
        ? new Date(userProfile.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        })
        : new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        })

    const customerData = {
        name: displayName,
        email: user.email || "",
        role: "Customer",
        avatar: "/placeholder.svg?height=100&width=100",
        joinDate: joinDate,
        stats: {
            totalOrders: 12,
            totalSpent: "$1,245",
            loyaltyPoints: 2450,
            savedItems: 8,
        },
        recentOrders: [
            { id: "#3421", date: "Dec 15, 2024", total: "$89.99", status: "Delivered" },
            { id: "#3398", date: "Nov 28, 2024", total: "$156.50", status: "Delivered" },
            { id: "#3365", date: "Nov 12, 2024", total: "$45.00", status: "Delivered" },
        ],
    }

    const adminData = {
        name: displayName,
        email: user.email || "",
        role: "Admin",
        avatar: "/placeholder.svg?height=100&width=100",
        joinDate: joinDate,
        stats: {
            totalOrders: 1247,
            totalRevenue: "$45,230",
            activeProducts: 156,
            totalCustomers: 892,
        },
    }

    const currentUser = isAdmin ? adminData : customerData

    async function handleSignOut() {
        const response = await fetch("/auth/signout", {
            method: "POST",
        })
        if (response.ok) {
            window.location.href = "/login"
        }
    }

    return (
        <div className="min-h-screen bg-gray-[#D7D2AE] p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Success/Error Messages */}
                {searchParams?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-600">{decodeURIComponent(searchParams.success)}</p>
                    </div>
                )}

                {searchParams?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-600">{decodeURIComponent(searchParams.error)}</p>
                    </div>
                )}

                <div className="flex items-center justify-between rounded-lg bg-[#F7F1C5] p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <div className="flex items-center gap-2 text-[#69ab3c]">
                                    <Crown className="h-5 w-5" />
                                    <span className="font-medium">Admin Dashboard</span>
                                </div>
                            )}
                            {!isAdmin && (
                                <div className="flex items-center gap-2 text-[#69ab3c]">
                                    <ShoppingBag className="h-5 w-5" />
                                    <span className="font-medium">Customer Portal</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <Button asChild variant="outline" className="gap-2 text-[#69ab3c] hover:text-[#69ab3c] bg-transparent">
                                <Link href="/admin">
                                    <Crown className="h-4 w-4" />
                                    Admin Panel
                                </Link>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="gap-2 text-[#69ab3c] hover:text-red-600 hover:border-red-600 bg-transparent"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                                <AvatarFallback className="text-lg">
                                    {currentUser.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-[#69ab3c]">{currentUser.name}</h1>
                                    {isAdmin ? (
                                        <Badge variant="destructive" className="gap-1">
                                            <Crown className="h-3 w-3" />
                                            Admin
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1">
                                            <Star className="h-3 w-3" />
                                            Customer
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-[#a2c078]">{currentUser.email}</p>
                                <p className="text-sm text-muted-foreground text-[#a2c078]">Member since {currentUser.joinDate}</p>
                                <p className="text-xs text-muted-foreground text-[#a2c078]">User ID: {user.id}</p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className="gap-2 text-[#69ab3c] hover:text-[#69ab3c] bg-transparent"
                            >
                                <Edit className="h-4 w-4" />
                                {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isAdmin ? (
                        <>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Orders</p>
                                            <p className="text-2xl font-bold">{adminData.stats.totalOrders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                                            <p className="text-2xl font-bold">{adminData.stats.totalRevenue}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Active Products</p>
                                            <p className="text-2xl font-bold">{adminData.stats.activeProducts}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Customers</p>
                                            <p className="text-2xl font-bold">{adminData.stats.totalCustomers}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Orders</p>
                                            <p className="text-2xl font-bold">{customerData.stats.totalOrders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Spent</p>
                                            <p className="text-2xl font-bold">{customerData.stats.totalSpent}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Loyalty Points</p>
                                            <p className="text-2xl font-bold">{customerData.stats.loyaltyPoints}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Saved Items</p>
                                            <p className="text-2xl font-bold">{customerData.stats.savedItems}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Tabs content */}
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="management">{isAdmin ? "User Management" : "Orders"}</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    {isEditingProfile ? "Update your account details" : "Your account details from Supabase"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditingProfile ? (
                                    <form action={updateProfile} className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name *</Label>
                                                <Input id="firstName" name="firstName" defaultValue={userProfile?.first_name || ""} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name *</Label>
                                                <Input id="lastName" name="lastName" defaultValue={userProfile?.last_name || ""} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                                            <p className="text-sm text-gray-600">Email cannot be changed from this page</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input id="role" defaultValue={userProfile?.role || "customer"} disabled />
                                        </div>
                                        <div className="flex gap-4">
                                            <Button type="submit" className="gap-2">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditingProfile(false)}
                                                className="bg-transparent"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" defaultValue={userProfile?.first_name || ""} disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" defaultValue={userProfile?.last_name || ""} disabled />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input id="role" defaultValue={userProfile?.role || "customer"} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="userId">User ID</Label>
                                            <Input id="userId" defaultValue={user.id} disabled />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="management">
                        <Card>
                            <CardHeader>
                                <CardTitle>{isAdmin ? "User Management" : "Your Orders"}</CardTitle>
                                <CardDescription>
                                    {isAdmin ? "Manage users and system settings" : "View your order history"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isAdmin ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Quick access to admin features.</p>
                                        <div className="grid gap-2">
                                            <Button variant="outline" className="justify-start bg-transparent" asChild>
                                                <Link href="/admin/customers">
                                                    <Users className="mr-2 h-4 w-4" />
                                                    View All Customers
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="justify-start bg-transparent" asChild>
                                                <Link href="/admin/products">
                                                    <Package className="mr-2 h-4 w-4" />
                                                    Manage Products
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="justify-start bg-transparent" asChild>
                                                <Link href="/admin/analytics">
                                                    <TrendingUp className="mr-2 h-4 w-4" />
                                                    View Analytics
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Your order history will be displayed here.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>Account settings and preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={updateNewsletterSubscription} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Newsletter Subscription</p>
                                            <p className="text-sm text-muted-foreground">Receive updates and promotions</p>
                                        </div>
                                        <Switch name="subscribeNewsletter" defaultChecked={userProfile?.subscribe_newsletter} />
                                    </div>
                                    <Button type="submit" className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Save Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your account security</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={updatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                minLength={6}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                minLength={6}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button type="submit" className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
