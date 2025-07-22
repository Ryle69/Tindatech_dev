"use client"

import { useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Package, ShoppingBag, Star, TrendingUp, Users, LogOut, Crown, Eye, EyeOff, X, Check } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { updateProfile, updateNewsletterSubscription, updatePassword } from "./actions"
import OrderHistory from "./OrderHistory";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {useSearchParams} from "next/navigation";

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
}

export default function ProfileClient({ user, userProfile }: ProfileClientProps) {
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get("tab") || 'profile'
    const [isEditing, setIsEditing] = useState(false)
    const [editedFirstName, setEditedFirstName] = useState(userProfile?.first_name || "")
    const [editedLastName, setEditedLastName] = useState(userProfile?.last_name || "")
    const [newsletterSubscription, setNewsletterSubscription] = useState(userProfile?.subscribe_newsletter || false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [isPending, startTransition] = useTransition()

    // Password change states
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

    const [orderCount, setOrderCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchOrderCount() {
            if (!userProfile?.auth_id) return;
            const supabase = createClient();
            const { count, error } = await supabase
                .from("Orders")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userProfile.auth_id);
            if (!error) setOrderCount(count ?? 0);
        }
        fetchOrderCount();
    }, [userProfile?.auth_id]);

    const customerData = {
        name: displayName,
        email: user.email || "",
        role: "Customer",
        avatar: "/placeholder.svg?height=100&width=100",
        joinDate: joinDate,
        stats: {
            totalOrders: orderCount ?? 0, // now dynamic
            totalSpent: "$1,245",
            loyaltyPoints: 2450,
            savedItems: 8,
        },
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

    function handleEditToggle() {
        if (isEditing) {
            // Reset to original values when canceling
            setEditedFirstName(userProfile?.first_name || "")
            setEditedLastName(userProfile?.last_name || "")
        }
        setIsEditing(!isEditing)
        setMessage(null)
    }

    async function handleProfileSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateProfile(formData)
            if (result.error) {
                setMessage({ type: "error", text: result.error })
            } else {
                setMessage({ type: "success", text: result.success || "Profile updated successfully" })
                setIsEditing(false)
            }
        })
    }

    async function handleNewsletterSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateNewsletterSubscription(formData)
            if (result.error) {
                setMessage({ type: "error", text: result.error })
            } else {
                setMessage({ type: "success", text: result.success || "Newsletter subscription updated" })
            }
        })
    }

    async function handlePasswordSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updatePassword(formData)
            if (result.error) {
                setMessage({ type: "error", text: result.error })
            } else {
                setMessage({ type: "success", text: result.success || "Password updated successfully" })
                // Reset form
                const form = document.getElementById("password-form") as HTMLFormElement
                form?.reset()
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-[#D7D2AE] p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header with Sign Out */}
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

                {/* Message Display */}
                {message && (
                    <div
                        className={`p-4 rounded-lg flex items-center gap-2 ${
                            message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {message.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}

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
                                className="gap-2 text-[#69ab3c] hover:text-[#69ab3c] bg-transparent"
                                onClick={handleEditToggle}
                            >
                                <Edit className="h-4 w-4" />
                                {isEditing ? "Cancel Edit" : "Edit Profile"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
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
                <Tabs defaultValue={defaultTab} className="space-y-6">
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
                                    {isEditing ? "Edit your account details" : "Your account details from Supabase"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditing ? (
                                    <form action={handleProfileSubmit} className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={editedFirstName}
                                                    onChange={(e) => setEditedFirstName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={editedLastName}
                                                    onChange={(e) => setEditedLastName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={isPending}>
                                                {isPending ? "Saving..." : "Save Changes"}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={handleEditToggle}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" value={userProfile?.first_name || ""} disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" value={userProfile?.last_name || ""} disabled />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={currentUser.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input id="role" value={userProfile?.role || "customer"} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="userId">User ID</Label>
                                            <Input id="userId" value={user.id} disabled />
                                        </div>
                                    </>
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
        <p className="text-sm text-muted-foreground">Admin management features will be implemented here.</p>
        <div className="grid gap-2">
            <Button variant="outline" className="justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                View All Users
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
            </Button>
        </div>
    </div>
) : (
    userProfile?.auth_id ? (
      <OrderHistory userId={userProfile.auth_id} />
    ) : (
      <p className="text-sm text-muted-foreground">Loading order history...</p>
    )
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
                                <form action={handleNewsletterSubmit} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Newsletter Subscription</p>
                                            <p className="text-sm text-muted-foreground">Receive updates and promotions</p>
                                        </div>
                                        <Switch
                                            name="subscribeNewsletter"
                                            checked={newsletterSubscription}
                                            onCheckedChange={setNewsletterSubscription}
                                        />
                                        <input type="hidden" name="subscribeNewsletter" value={newsletterSubscription.toString()} />
                                    </div>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Saving..." : "Save Settings"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Change your password</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter current password"
                                                className="pr-10"
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
                                                placeholder="Enter new password (min 6 characters)"
                                                className="pr-10"
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
                                                placeholder="Confirm new password"
                                                className="pr-10"
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

                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Updating..." : "Update Password"}
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
