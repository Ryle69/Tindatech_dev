import { NextRequest, NextResponse } from 'next/server';
import PayMongoAPI, { convertToCentavos } from '@/utils/paymongo';

const payMongo = new PayMongoAPI(
    process.env.PAYMONGO_SECRET_KEY!,
    process.env.PAYMONGO_PUBLIC_KEY!
);

function flattenMetadata(obj: any): Record<string, string> {
    const result: Record<string, string> = {};

    function recurse(cur: any, prefix = '') {
        for (const key in cur) {
            const value = cur[key];
            const newKey = prefix ? `${prefix}_${key}` : key;

            if (typeof value === 'object' && value !== null) {
                recurse(value, newKey);
            } else {
                result[newKey] = String(value);
            }
        }
    }

    recurse(obj);
    return result;
}

function sanitizeStatementDescriptor(descriptor: string): string {
    return descriptor
        .replace(/[<>'"\\*]/g, '')
        .substring(0, 22);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'PHP', paymentMethod, description, metadata } = body;
        const amountInCentavos = convertToCentavos(amount);

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
            description: description || "Cherylls Fashion Boutique Purchase",
            statement_descriptor: sanitizeStatementDescriptor("Cherylls Fashion Boutique"),
            metadata: metadata ? flattenMetadata(metadata) : {}
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