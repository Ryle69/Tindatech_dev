interface PayMongoLineItem {
    name: string;
    quantity: number;
    amount: number;
    currency: string;
    description?: string;
}

interface CreatePaymentIntentData {
    amount: number;
    currency: string;
    payment_method_allowed: string[];
    description?: string;
    statement_descriptor?: string;
    metadata?: Record<string, any>;
}

interface CreateCheckoutSessionData {
    cancel_url: string;
    success_url: string;
    line_items: PayMongoLineItem[];
    payment_method_types: string[];
    description?: string;
    metadata?: Record<string, any>;
}

class PayMongoAPI {
    private secretKey: string;
    private publicKey: string;
    private baseURL = 'https://api.paymongo.com/v1';

    constructor(secretKey: string, publicKey: string) {
        this.secretKey = secretKey;
        this.publicKey = publicKey;
    }

    private getAuthHeaders(usePublicKey = false) {
        const key = usePublicKey ? this.publicKey : this.secretKey;
        return {
            'Authorization': `Basic ${Buffer.from(key + ':').toString('base64')}`,
            'Content-Type': 'application/json',
        };
    }

    async createPaymentIntent(data: CreatePaymentIntentData) {
        try {
            const response = await fetch(`${this.baseURL}/payment_intents`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    data: {
                        attributes: data
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayMongo API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    async createCheckoutSession(data: CreateCheckoutSessionData) {
        try {
            const response = await fetch(`${this.baseURL}/checkout_sessions`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    data: {
                        attributes: data
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayMongo API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    async attachPaymentMethod(paymentIntentId: string, paymentMethodId: string, clientKey: string) {
        try {
            const response = await fetch(`${this.baseURL}/payment_intents/${paymentIntentId}/attach`, {
                method: 'POST',
                headers: this.getAuthHeaders(true),
                body: JSON.stringify({
                    data: {
                        attributes: {
                            payment_method: paymentMethodId,
                            client_key: clientKey
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayMongo API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error attaching payment method:', error);
            throw error;
        }
    }

    async createPaymentMethod(type: string, details: any) {
        try {
            const response = await fetch(`${this.baseURL}/payment_methods`, {
                method: 'POST',
                headers: this.getAuthHeaders(true),
                body: JSON.stringify({
                    data: {
                        attributes: {
                            type,
                            details
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayMongo API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        }
    }

    async getPaymentIntent(paymentIntentId: string) {
        try {
            const response = await fetch(`${this.baseURL}/payment_intents/${paymentIntentId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayMongo API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error retrieving payment intent:', error);
            throw error;
        }
    }
}

export const convertToCentavos = (amount: number): number => {
    return Math.round(amount * 100);
};

export const convertFromCentavos = (centavos: number): number => {
    return centavos / 100;
};

export default PayMongoAPI;