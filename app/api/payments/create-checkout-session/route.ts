// app/api/payments/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PayMongoAPI, { convertToCentavos } from '@/utils/paymongo';

const payMongo = new PayMongoAPI(
    process.env.PAYMONGO_SECRET_KEY!,
    process.env.PAYMONGO_PUBLIC_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, paymentMethod, orderId, description } = body;

        // Convert items to PayMongo line items format
        const lineItems = items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            amount: convertToCentavos(item.product_price),
            currency: 'PHP',
            description: item.product_name
        }));

        // Define payment method types
        let paymentMethodTypes = ['gcash'];
        if (paymentMethod === 'maya') {
            paymentMethodTypes = ['paymaya'];
        }

        const checkoutSessionData = {
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?canceled=true`,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order_id=${orderId}`,
            line_items: lineItems,
            payment_method_types: paymentMethodTypes,
            description: description || 'Online Store Purchase',
            metadata: {
                order_id: orderId.toString()
            }
        };

        const result = await payMongo.createCheckoutSession(checkoutSessionData);

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Checkout Session Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}