import Stripe from "stripe"
import { stripe } from "../../app"
import { ENV } from "../dotenv/env"
import Order from "../../api/models/orders"
import { getItemByField } from "../../api/services/genericCrudService"
import { PaymentMethods } from "../../api/models/enums/paymentMethods"
import ApiError from "../../api/errors/ApiError"
import { StatusCodes } from "http-status-codes"

export const stripeService = {
    createCheckoutSession: async (productName: string, price: number, orderId: string): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
        const order = await getItemByField(Order, '_id', orderId);

        if (order.paymentMethod != PaymentMethods.ONLINE_PAYMENT) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot use this online payment, the payment method in your order is not compatible with this type of payment.");
        }

        return await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'uah',
                        product_data: { name: productName },
                        unit_amount: price * 100
                    },
                    quantity: 1
                }
            ],
            metadata: { orderId },
            success_url: ENV.HOST_URI + '/api/orders/successful-payment?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: ENV.HOST_URI + '/api/orders/unsuccessful-payment?session_id={CHECKOUT_SESSION_ID}',
        })
    }
}