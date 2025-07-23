"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, CreditCard, Home, MapPin, Truck, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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

const formSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
    shippingMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["card", "gcash", "maya"]),
    // Card details for direct payment
    cardNumber: z.string().optional(),
    cardExpMonth: z.string().optional(),
    cardExpYear: z.string().optional(),
    cardCvc: z.string().optional(),
})

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [orderId, setOrderId] = useState<number | null>(null)
    const [processingPayment, setProcessingPayment] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { updateCartCount } = useCart()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            shippingMethod: "standard",
            paymentMethod: "card",
        },
    })

    useEffect(() => {
        const fetchCart = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                router.push("/login?returnUrl=/checkout")
                return
            }

            try {
                const { data: cartData, error: cartError } = await supabase
                    .from("Carts")
                    .select("id")
                    .eq("user_id", user.id)
                    .single()

                if (cartError || !cartData) {
                    setCartItems([])
                    return
                }

                const { data: itemsData, error: itemsError } = await supabase
                    .from("CartItems")
                    .select(`
                        id,
                        quantity,
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

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product_price * item.quantity), 0
    )

    const shippingCost = form.watch("shippingMethod") === "express" ? 15.00 : 5.00
    const total = subtotal + shippingCost

    const processCardPayment = async (values: z.infer<typeof formSchema>, orderData: any) => {
        try {
            const paymentIntentResponse = await fetch('/api/payments/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: 'PHP',
                    paymentMethod: values.paymentMethod,
                    description: `Order #${orderData.id}`,
                    metadata: { order_id: orderData.id }
                })
            });

            const paymentIntentResult = await paymentIntentResponse.json();
            if (!paymentIntentResult.success) {
                throw new Error(paymentIntentResult.error);
            }

            const paymentMethodResponse = await fetch('/api/payments/create-payment-method', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'card',
                    details: {
                        card_number: values.cardNumber?.replace(/\s/g, ''),
                        exp_month: parseInt(values.cardExpMonth || '0'),
                        exp_year: parseInt(values.cardExpYear || '0'),
                        cvc: values.cardCvc
                    }
                })
            });

            const paymentMethodResult = await paymentMethodResponse.json();
            if (!paymentMethodResult.success) {
                throw new Error(paymentMethodResult.error);
            }

            const attachResponse = await fetch('/api/payments/attach-payment-method', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIntentId: paymentIntentResult.data.id,
                    paymentMethodId: paymentMethodResult.data.id,
                    clientKey: paymentIntentResult.data.attributes.client_key,
                    orderId: orderData.id
                })
            });

            const attachResult = await attachResponse.json();
            if (!attachResult.success) {
                throw new Error(attachResult.error);
            }

            if (attachResult.data.attributes.status === 'succeeded') {
                return { success: true };
            } else {
                throw new Error('Payment failed or requires additional authentication');
            }

        } catch (error) {
            console.error('Card payment error:', error);
            throw error;
        }
    }

    const processEWalletPayment = async (values: z.infer<typeof formSchema>, orderData: any) => {
        try {
            const checkoutSessionResponse = await fetch('/api/payments/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems,
                    paymentMethod: values.paymentMethod,
                    orderId: orderData.id,
                    description: `Order #${orderData.id}`
                })
            });

            const sessionResult = await checkoutSessionResponse.json();
            if (!sessionResult.success) {
                throw new Error(sessionResult.error);
            }

            window.location.href = sessionResult.data.attributes.checkout_url;
            return { success: true };

        } catch (error) {
            console.error('E-wallet payment error:', error);
            throw error;
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setProcessingPayment(true);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                router.push("/login")
                return
            }

            const { data: orderData, error: orderError } = await supabase
                .from("Orders")
                .insert([{
                    user_id: user.id,
                    shipping_address: JSON.stringify({
                        address: values.address,
                        city: values.city,
                        state: values.state,
                        zip: values.zip,
                        country: values.country,
                        firstName: values.firstName,
                        lastName: values.lastName,
                    }),
                    shipping_method: values.shippingMethod,
                    payment_method: values.paymentMethod,
                    subtotal: subtotal,
                    shipping_amount: shippingCost,
                    total_amount: total,
                    status: "processing",
                    payment_status: "pending",
                    currency: "PHP",
                }])
                .select()
                .single()

            if (orderError) throw orderError

            const orderItems = cartItems.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.product_price,
                total_price: item.product_price * item.quantity,
                user_id: user.id
            }))

            const { error: itemsError } = await supabase
                .from("OrderItems")
                .insert(orderItems)

            if (itemsError) throw itemsError

            if (values.paymentMethod === 'card') {
                await processCardPayment(values, orderData);
            } else {
                await processEWalletPayment(values, orderData);
                return;
            }

            const { data: cartData, error: cartError } = await supabase
                .from("Carts")
                .select("id")
                .eq("user_id", user.id)
                .single()

            if (!cartError && cartData) {
                await supabase
                    .from("CartItems")
                    .delete()
                    .eq("cart_id", cartData.id)
            }

            await updateCartCount()

            setOrderId(orderData.id)
            setOrderSuccess(true)

        } catch (error) {
            console.error("Error placing order:", error)
            setError(error instanceof Error ? error.message : "Failed to place order. Please try again.")
        } finally {
            setProcessingPayment(false)
        }
    }

    const selectedPaymentMethod = form.watch("paymentMethod");

    if (loading) {
        return (
            <div className="container px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (orderSuccess) {
        return (
            <div className="container px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Order Received!</h1>
                    <p className="text-gray-600 mb-8">
                        Your order #{orderId} has been received and is being processed by our team.
                        You'll receive a confirmation once your order is confirmed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/storefront">Back to Storefront</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/profile?tab=management">View Order</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="container px-4 py-12">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-gray-600 mb-6">There's nothing to checkout</p>
                    <Button asChild>
                        <Link href="/storefront">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Checkout</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Home className="h-4 w-4" />
                    <span>/</span>
                    <Link href="/cart" className="hover:underline">Cart</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Checkout</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Shipping Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...form.register("email")}
                                    placeholder="your@email.com"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div></div>
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...form.register("firstName")}
                                    placeholder="John"
                                />
                                {form.formState.errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...form.register("lastName")}
                                    placeholder="Doe"
                                />
                                {form.formState.errors.lastName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.lastName.message}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    {...form.register("address")}
                                    placeholder="123 Main St"
                                />
                                {form.formState.errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.address.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    {...form.register("city")}
                                    placeholder="New York"
                                />
                                {form.formState.errors.city && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.city.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    {...form.register("state")}
                                    placeholder="NY"
                                />
                                {form.formState.errors.state && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.state.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="zip">ZIP/Postal Code</Label>
                                <Input
                                    id="zip"
                                    {...form.register("zip")}
                                    placeholder="10001"
                                />
                                {form.formState.errors.zip && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.zip.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    {...form.register("country")}
                                    placeholder="Philippines"
                                />
                                {form.formState.errors.country && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.country.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Shipping Method
                        </h2>
                        <RadioGroup
                            defaultValue="standard"
                            className="space-y-4"
                            onValueChange={(value) => form.setValue("shippingMethod", value as "standard" | "express")}
                        >
                            <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-gray-400">
                                <RadioGroupItem value="standard" id="standard" />
                                <Label htmlFor="standard" className="flex-1">
                                    <div className="flex justify-between">
                                        <span>Standard Shipping</span>
                                        <span>₱5.00</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">3-5 business days</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-gray-400">
                                <RadioGroupItem value="express" id="express" />
                                <Label htmlFor="express" className="flex-1">
                                    <div className="flex justify-between">
                                        <span>Express Shipping</span>
                                        <span>₱15.00</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">1-2 business days</p>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Method
                        </h2>
                        <RadioGroup
                            onValueChange={(value) => form.setValue("paymentMethod", value as "card" | "gcash" | "maya")}
                            defaultValue={form.watch("paymentMethod")}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-gray-400">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-1">
                                    <div className="flex justify-between">
                                        <span>Credit/Debit Card</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Pay with Visa, Mastercard, etc.</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-gray-400">
                                <RadioGroupItem value="gcash" id="gcash" />
                                <Label htmlFor="gcash" className="flex-1">
                                    <div className="flex justify-between">
                                        <span>GCash</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Pay using your GCash wallet</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-gray-400">
                                <RadioGroupItem value="maya" id="maya" />
                                <Label htmlFor="maya" className="flex-1">
                                    <div className="flex justify-between">
                                        <span>Maya</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Pay using your Maya wallet</p>
                                </Label>
                            </div>
                        </RadioGroup>
                        {form.formState.errors.paymentMethod && (
                            <p className="text-red-500 text-sm mt-2">{form.formState.errors.paymentMethod.message}</p>
                        )}

                        {selectedPaymentMethod === 'card' && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium mb-4">Card Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="cardNumber">Card Number</Label>
                                        <Input
                                            id="cardNumber"
                                            {...form.register("cardNumber")}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                                e.target.value = value;
                                                form.setValue("cardNumber", value);
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="cardExpMonth">Month</Label>
                                            <Input
                                                id="cardExpMonth"
                                                {...form.register("cardExpMonth")}
                                                placeholder="MM"
                                                maxLength={2}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cardExpYear">Year</Label>
                                            <Input
                                                id="cardExpYear"
                                                {...form.register("cardExpYear")}
                                                placeholder="YYYY"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cardCvc">CVC</Label>
                                            <Input
                                                id="cardCvc"
                                                {...form.register("cardCvc")}
                                                placeholder="123"
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <Table>
                            <TableBody>
                                {cartItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-4 py-2">
                                            <img
                                                src={item.product_image || "/placeholder.svg"}
                                                alt={item.product_name}
                                                className="w-12 h-12 object-cover rounded"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                }}
                                            />
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity} × ₱{item.product_price.toFixed(2)}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            ₱{(item.product_price * item.quantity).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₱{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>₱{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                <span>Total</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={processingPayment}
                        >
                            {processingPayment ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                "Place Order"
                            )}
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                        <h3 className="font-medium mb-2">Need help?</h3>
                        <p>Contact us at support@example.com or call (123) 456-7890</p>
                    </div>
                </div>
            </form>
        </div>
    )
}