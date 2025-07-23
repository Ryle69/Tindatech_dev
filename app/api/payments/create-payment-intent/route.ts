// app/api/payments/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PayMongoAPI, { convertToCentavos } from '@/utils/paymongo';

const payMongo = new PayMongoAPI(
    process.env.PAYMONGO_SECRET_KEY!,
    process.env.PAYMONGO_PUBLIC_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'PHP', paymentMethod, description, metadata } = body;

        // Convert amount to centavos
        const amountInCentavos = convertToCentavos(amount);

        // Define allowed payment methods based on selection
        let paymentMethodsAllowed = ['card'];
        if (paymentMethod === 'gcash') {
            paymentMethodsAllowed = ['gcash'];
        } else if (paymentMethod === 'maya') {
            paymentMethodsAllowed = ['paymaya'];
        }

        const paymentIntentData = {
            amount: amountInCentavos,
            currency,
            payment_method_allowed: paymentMethodsAllowed,
            description: description || 'Online Store Purchase',
            statement_descriptor: 'YOURSTORE',
            metadata: metadata || {}
        };

        const result = await payMongo.createPaymentIntent(paymentIntentData);

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Payment Intent Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}