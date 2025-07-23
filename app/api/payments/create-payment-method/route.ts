// app/api/payments/create-payment-method/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PayMongoAPI from '@/utils/paymongo';

const payMongo = new PayMongoAPI(
    process.env.PAYMONGO_SECRET_KEY!,
    process.env.PAYMONGO_PUBLIC_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, details } = body;

        const result = await payMongo.createPaymentMethod(type, details);

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Payment Method Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}