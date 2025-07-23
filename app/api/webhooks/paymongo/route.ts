import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('paymongo-signature');

        const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET!;
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        const supabase = await createClient(cookies());

        switch (event.data.attributes.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.attributes.data;
                const orderId = paymentIntent.attributes.metadata?.order_id;

                if (orderId) {
                    await supabase
                        .from('Orders')
                        .update({
                            status: 'confirmed',
                            payment_status: 'paid',
                            payment_id: paymentIntent.id,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', orderId);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.attributes.data;
                const failedOrderId = failedPayment.attributes.metadata?.order_id;

                if (failedOrderId) {
                    await supabase
                        .from('Orders')
                        .update({
                            payment_status: 'failed',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', failedOrderId);
                }
                break;

            case 'checkout_session.payment.paid':
                const checkoutSession = event.data.attributes.data;
                const sessionOrderId = checkoutSession.attributes.metadata?.order_id;

                if (sessionOrderId) {
                    await supabase
                        .from('Orders')
                        .update({
                            status: 'confirmed',
                            payment_status: 'paid',
                            payment_id: checkoutSession.id,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', sessionOrderId);
                }
                break;
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}