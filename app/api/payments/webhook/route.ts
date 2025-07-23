// app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    const rawBody = await req.text(); // important: get raw text before parsing JSON
    const signature = req.headers.get("Paymongo-Signature");

    if (!signature || !verifySignature(signature, rawBody, PAYMONGO_WEBHOOK_SECRET)) {
        return new NextResponse("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const type = payload.data?.type;

    if (type === "checkout_session.payment.paid") {
        const { reference_number, id: sessionId } = payload.data.attributes;
        const orderNum = parseInt(reference_number.replace("ORD‑", ""));
        const cookieStore = cookies();
        const supabase = await createClient(cookieStore);

        await supabase
            .from("Orders")
            .update({ payment_status: "paid", payment_reference: sessionId })
            .eq("order_number", orderNum);

        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: false });
}

function verifySignature(signature: string, payload: string, secret: string): boolean {
    try {
        const [timestampPart, signaturePart] = signature.split(",");
        const timestamp = timestampPart.split("=")[1];
        const theirSignature = signaturePart.split("=")[1];

        const payloadToSign = `${timestamp}.${payload}`;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(payloadToSign);
        const mySignature = hmac.digest("hex");

        return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(mySignature));
    } catch {
        return false;
    }
}
