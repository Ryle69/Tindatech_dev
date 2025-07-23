"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, XCircle, Home, Receipt } from "lucide-react"
import Link from "next/link"

interface Order {
    id: number
    status: string
    payment_status: string
    total_amount: number
    created_at: string
}

export default function CheckoutSuccessPage() {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const supabase = createClient()

    useEffect(() => {
        const fetchOrderStatus = async () => {
            if (!orderId) {
                setError("Order ID not found")
                setLoading(false)
                return
            }

            try {
                // Fetch order details
                const { data: orderData, error: orderError } = await supabase
                    .from('Orders')
                    .select('id, status, payment_status, total_amount, created_at')
                    .eq('id', orderId)
                    .single()

                if (orderError || !orderData) {
                    setError("Order not found")
                    return
                }

                setOrder(orderData)
            } catch (error) {
                console.error('Error fetching order:', error)
                setError("Failed to fetch order details")
            } finally {
                setLoading(false)
            }
        }

        fetchOrderStatus()

        // Poll for payment status updates (in case webhook hasn't processed yet)
        const pollInterval = setInterval(fetchOrderStatus, 3000)

        // Clear interval after 30 seconds
        const timeout = setTimeout(() => {
            clearInterval(pollInterval)
        }, 30000)

        return () => {
            clearInterval(pollInterval)
            clearTimeout(timeout)
        }
    }, [orderId, supabase])

    if (loading) {
        return (
            <div className="container px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
                    <h1 className="text-2xl font-bold mb-4">Processing Your Payment</h1>
                    <p className="text-gray-600">
                        Please wait while we confirm your payment...
                    </p>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="container px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-gray-600 mb-8">
                        {error || "We couldn't find your order. Please contact support if you believe this is an error."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/storefront">
                                <Home className="mr-2 h-4 w-4" />
                                Back to Store
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/profile?tab=management">
                                <Receipt className="mr-2 h-4 w-4" />
                                View Orders
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const isPaymentSuccessful = order.payment_status === 'paid'
    const isPaymentPending = order.payment_status === 'pending'

    return (
        <div className="container px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
                {isPaymentSuccessful ? (
                    <>
                        <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
                        <h1 className="text-3xl font-bold mb-4 text-green-800">Payment Successful!</h1>
                        <p className="text-gray-600 mb-2">
                            Thank you for your purchase. Your order has been confirmed.
                        </p>
                    </>
                ) : isPaymentPending ? (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
                        <h1 className="text-3xl font-bold mb-4 text-blue-800">Payment Processing</h1>
                        <p className="text-gray-600 mb-2">
                            Your payment is being processed. This may take a few minutes.
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
                        <h1 className="text-3xl font-bold mb-4 text-red-800">Payment Failed</h1>
                        <p className="text-gray-600 mb-2">
                            There was an issue with your payment. Please try again or contact support.
                        </p>
                    </>
                )}

                <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
                    <h2 className="font-semibold mb-4">Order Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Order ID:</span>
                            <span className="font-mono">#{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount:</span>
                            <span className="font-semibold">₱{order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Order Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Payment Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : order.payment_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Order Date:</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                        <Link href="/storefront">
                            <Home className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/profile?tab=management">
                            <Receipt className="mr-2 h-4 w-4" />
                            View Order Details
                        </Link>
                    </Button>
                </div>

                {isPaymentPending && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                        <p className="font-medium mb-2">What happens next?</p>
                        <ul className="text-left space-y-1">
                            <li>• Your payment is being verified by our payment processor</li>
                            <li>• You'll receive an email confirmation once payment is complete</li>
                            <li>• If payment fails, we'll notify you and you can try again</li>
                            <li>• This page will automatically update when payment is confirmed</li>
                        </ul>
                    </div>
                )}

                {!isPaymentSuccessful && !isPaymentPending && (
                    <div className="mt-8 p-4 bg-red-50 rounded-lg text-sm text-red-800">
                        <p className="font-medium mb-2">Need help?</p>
                        <p>
                            If you believe there was an error, please contact our support team at{" "}
                            <a href="mailto:support@example.com" className="underline">
                                support@example.com
                            </a>{" "}
                            with your order ID: #{order.id}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}