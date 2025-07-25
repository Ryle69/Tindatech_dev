"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {Minus, Plus, Trash2, ShoppingCart, Loader2} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import Image from "next/image";

interface CartItem {
    id: number
    cart_id: number
    product_id: number
    product_name: string
    product_price: number
    product_image: string | null
    quantity: number
    size?: string | null
    color?: string | null
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [shopRedirect, setShopRedirect] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { updateCartCount } = useCart()

    useEffect(() => {
        const fetchCart = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                setIsAuthenticated(false)
                setLoading(false)
                return
            }

            setIsAuthenticated(true)

            try {
                // First get the user's cart
                const { data: cartData, error: cartError } = await supabase
                    .from("Carts")
                    .select("id")
                    .eq("user_id", user.id)
                    .single()

                if (cartError || !cartData) {
                    setCartItems([])
                    return
                }

                // Then get cart items with product details
                const { data: itemsData, error: itemsError } = await supabase
                    .from("CartItems")
                    .select(`
                        id,
                        quantity,
                        size,
                        color,
                        Products (
                            id,
                            name,
                            price,
                            image
                        )
                    `)
                    .eq("cart_id", cartData.id)

                if (itemsError) throw itemsError

                const items = (itemsData ?? []).map((item: any) => ({
                    id: item.id,
                    cart_id: cartData.id,
                    product_id: item.Products.id,
                    product_name: item.Products.name,
                    product_price: item.Products.price,
                    product_image: item.Products.image,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                }))

                setCartItems(items)
                setError(null)
            } catch (error) {
                console.error("Error fetching cart:", error)
                setError("Failed to load cart items. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchCart()
    }, [router, supabase])

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return

        try {
            const { error } = await supabase
                .from("CartItems")
                .update({ quantity: newQuantity })
                .eq("id", itemId)

            if (error) throw error

            setCartItems(cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ))

            // Update cart count in context
            await updateCartCount()
        } catch (error) {
            console.error("Error updating quantity:", error)
            setError("Failed to update quantity. Please try again.")
        }
    }

    const removeItem = async (itemId: number) => {
        try {
            const { error } = await supabase
                .from("CartItems")
                .delete()
                .eq("id", itemId)

            if (error) throw error

            setCartItems(cartItems.filter(item => item.id !== itemId))

            // Update cart count in context
            await updateCartCount()
        } catch (error) {
            console.error("Error removing item:", error)
            setError("Failed to remove item. Please try again.")
        }
    }

    const clearCart = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) return

            const { data: cartData, error: cartError } = await supabase
                .from("Carts")
                .select("id")
                .eq("user_id", user.id)
                .single()

            if (cartError || !cartData) return

            const { error } = await supabase
                .from("CartItems")
                .delete()
                .eq("cart_id", cartData.id)

            if (error) throw error

            setCartItems([])
            await updateCartCount()
        } catch (error) {
            console.error("Error clearing cart:", error)
            setError("Failed to clear cart. Please try again.")
        }
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product_price * item.quantity), 0
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Image
                        src="/logo.svg"
                        alt="Loading Logo"
                        width={64}
                        height={64}
                        className="animate-pulse"
                    />
                    <p className="text-gray-700 text-lg font-medium">Loading Page...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="container px-4 py-8">
                <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">Log in to view your cart</h2>
                    <p className="text-gray-600 mb-6">Sign in to your account to start shopping</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/login">
                            <Button>Sign In</Button>
                        </Link>
                        <Link href="/storefront">
                            <Button variant="outline">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
                {cartItems.length > 0 && (
                    <Button variant="outline" onClick={clearCart}>
                        Clear Cart
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                    <Button
                        disabled = {shopRedirect}
                        onClick={async () => {
                            if (shopRedirect) return
                            setShopRedirect(true)
                            router.push("/storefront")
                        }}
                    >
                        {shopRedirect ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Going Back to Shop...
                            </>
                        ) : (
                            "Continue Shopping"
                        )}
                    </Button>

                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cartItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-4">
                                            <img
                                                src={item.product_image || "/placeholder.svg"}
                                                alt={item.product_name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                }}
                                            />
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>₱ {item.product_price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>₱ {(item.product_price * item.quantity).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg h-fit">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₱ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                <span>Total</span>
                                <span>₱ {subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full mb-4"
                            disabled={checkingOut}
                            onClick={async () => {
                                if (checkingOut) return
                                setCheckingOut(true)
                                router.push("/checkout")
                            }}
                        >
                            {checkingOut ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking Out...
                                </>
                            ) : (
                                "Proceed to Checkout"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled = {shopRedirect}
                            onClick={async () => {
                                if (shopRedirect) return
                                setShopRedirect(true)
                                router.push("/storefront")
                            }}
                        >
                            {shopRedirect ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Going Back to Shop...
                                </>
                            ) : (
                                "Continue Shopping"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}