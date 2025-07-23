// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { orderId, paymentMethod } = await req.json();

        if (!orderId || !paymentMethod) {
            return NextResponse.json({ error: "Missing orderId or paymentMethod" }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = await createClient(cookieStore);

        const { data: order, error: fetchError } = await supabase
            .from("Orders")
            .select("*")
            .eq("order_number", orderId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (!order.total_amount || isNaN(order.total_amount)) {
            return NextResponse.json({ error: "Invalid order total amount" }, { status: 400 });
        }

        const checkoutPayload = {
            data: {
                attributes: {
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    cancel_url: "https://your-domain.com/checkout?cancelled=true",
                    description: `Payment for order #${orderId}`,
                    reference_number: `ORD-${orderId}`,
                    success_url: "https://your-domain.com/checkout/success",
                    line_items: [
                        {
                            currency: "PHP",
                            amount: Math.round(order.total_amount * 100), // PHP to centavos
                            name: "Ukay-Ukay Order",
                            quantity: 1,
                        },
                    ],
                    payment_method_types: Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod], // ["gcash"], ["card"], etc.
                },
            },
        };

        const secret = process.env.PAYMONGO_SECRET_KEY;
        if (!secret) {
            return NextResponse.json({ error: "PayMongo secret key not set" }, { status: 500 });
        }

        const { data } = await axios.post("https://api.paymongo.com/v1/checkout_sessions", checkoutPayload, {
            headers: {
                Authorization: `Basic ${Buffer.from(secret + ":").toString("base64")}`,
                "Content-Type": "application/json",
            },
        });

        return NextResponse.json({ checkout_url: data.data.attributes.checkout_url });
    } catch (err) {
        if (err instanceof AxiosError) {
            console.error("Axios error:", err.response?.data || err.message);
            return NextResponse.json({ error: err.response?.data || "Axios error" }, { status: err.response?.status || 500 });
        } else {
            console.error("Unknown error:", err);
            return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
        }
    }
}
