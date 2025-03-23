import { ENV } from "../dotenv/env"
import Order from "../../api/models/orders"
import { getItemByField } from "../../api/services/genericCrudService"
import { PaymentMethods } from "../../api/models/enums/paymentMethods"
import ApiError from "../../api/errors/ApiError"
import { StatusCodes } from "http-status-codes"

export const stripeService = {
    createCheckoutSession: async (productName: string, price: number, orderId: string) => {
        const order = await getItemByField(Order, '_id', orderId);

        if (order.paymentMethod != PaymentMethods.ONLINE_PAYMENT) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot use this online payment, the payment method in your order is not compatible with this type of payment.");
        }

        const params = new URLSearchParams();

        params.append('payment_method_types[0]', 'card');
        params.append('mode', 'payment');
        params.append('metadata[orderId]', orderId);

        params.append('line_items[0][price_data][currency]', 'uah');
        params.append('line_items[0][price_data][product_data][name]', productName);
        params.append('line_items[0][price_data][unit_amount]', (price * 100).toString());
        params.append('line_items[0][quantity]', '1');

        params.append('success_url', `${ENV.HOST_URI}/api/orders/successful-payment?session_id={CHECKOUT_SESSION_ID}`);
        params.append('cancel_url', `${ENV.HOST_URI}/api/orders/unsuccessful-payment?session_id={CHECKOUT_SESSION_ID}`);

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ENV.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        const session = await response.json();
        return session;
    },

    retrieveStripeSessionById: async (sessionId: string) => {
        const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ENV.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const session = await response.json();
        return session;
    }
}