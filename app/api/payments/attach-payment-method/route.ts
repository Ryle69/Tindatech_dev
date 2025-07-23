import { NextRequest, NextResponse } from 'next/server';
import PayMongoAPI from '@/utils/paymongo';
import { createClient } from '@/utils/supabase/server';
import {cookies} from "next/headers";

const payMongo = new PayMongoAPI(
    process.env.PAYMONGO_SECRET_KEY!,
    process.env.PAYMONGO_PUBLIC_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentIntentId, paymentMethodId, clientKey, orderId } = body;

        const result = await payMongo.attachPaymentMethod(paymentIntentId, paymentMethodId, clientKey);

        // Payment successful -> update order status
        if (result.data.attributes.status === 'succeeded') {
            const supabase = await createClient(cookies());

            await supabase
                .from('Orders')
                .update({
                    status: 'pending',
                    payment_status: 'paid',
                    payment_id: result.data.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Attach Payment Method Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}