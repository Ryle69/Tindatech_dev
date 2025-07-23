// /app/api/payments/create/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { orderId, total, email, currency = "PHP" } = body;

    try {
        const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        send_email_receipt: true,
                        show_description: true,
                        show_line_items: true,
                        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
                        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
                        payment_method_types: ["gcash", "card"],
                        line_items: [
                            {
                                amount: Math.round(total * 100),
                                currency,
                                description: `Order #${orderId}`,
                                name: `Order #${orderId}`,
                                quantity: 1,
                            },
                        ],
                        reference_number: `ORD-${orderId}`,
                        customer_email: email,
                    },
                },
            }),
        });

        const result = await response.json();

        if (response.ok && result?.data?.attributes?.checkout_url) {
            return NextResponse.json({ checkoutUrl: result.data.attributes.checkout_url });
        } else {
            console.error("Checkout session error:", result);
            return NextResponse.json({ error: "Failed to create checkout session" }, { status: 400 });
        }
    } catch (err) {
        console.error("Error in create.ts:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
