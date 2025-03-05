import { HydratedDocument } from "mongoose";
import Order, { IOrder } from "../models/orders";
import Product from "../models/products";
import Cart from "../models/carts";
import mailController from "../../config/mail/mailController";
import NotFoundError from "../errors/general/NotFoundError";
import { OrderItem } from "../types/OrderTypes";
import { OrderStatuses } from "../models/enums/orderStatusesEnum";
import { ensureItemExists, getItemByField } from "./genericCrudService";
import BadRequestError from "../errors/general/BadRequestError";
import AuthorizationError from "../errors/auth/AuthorizationError";

export const orderService = {
    createOrder: async (body: { products: OrderItem[] } & any, user: any): Promise<HydratedDocument<IOrder>> => {
        const {
            deliveryCompanyId,
            firstName,
            lastName,
            telephone,
            email,
            products
        } = body;

        if (!user && !email) {
            throw new AuthorizationError("Email is required for non-registered users.");
        }

        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) throw new NotFoundError(`Product with ID ${item.productId} not found`);
            totalAmount += product.price * item.quantity;
        }

        let orderData: Partial<IOrder> = {
            deliveryCompanyId,
            firstName,
            lastName,
            telephone,
            email: user ? user.email : email,
            products,
            amountOrder: totalAmount
        };

        if (user) {
            orderData.userId = user._id;

            // Отримати кошик користувача
            const cart = await Cart.findOne({ userId: user._id });
            if (cart) {
                // Видалити куплені товари з кошика
                cart.products = cart.products.filter((cartItem) =>
                    !products.some((orderItem: OrderItem) => orderItem.productId === cartItem.productId.toString())
                );
                await cart.save();
            }
        }

        const order = new Order(orderData);
        const savedOrder = await order.save();

        // Оновлення запасів товарів
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        if (!user) {
            // Відправка email з деталями замовлення
            const orderDetails = {
                firstName,
                lastName,
                telephone,
                email,
                products,
                amountOrder: totalAmount
            };
            await mailController.sendMail(email, "Ваше замовлення", JSON.stringify(orderDetails, null, 2));
        }

        return savedOrder;
    },

    getAllStatuses: (): Array<OrderStatuses> => {
        return Object.values(OrderStatuses);
    },

    changeStatus: async (orderId: string, newStatus: string): Promise<IOrder> => {
        const currentStatus = (await getItemByField(Order, '_id', orderId)).status;

        if (!Object.values(OrderStatuses).includes(newStatus as OrderStatuses)) {
            throw new BadRequestError("This status doesn't exist")
        }

        if (newStatus === OrderStatuses.CANCELED && currentStatus !== OrderStatuses.RECEIVED) {
            return setStatus(orderId, newStatus);
        }

        switch (currentStatus as OrderStatuses) {
            case OrderStatuses.PROCESSING:
                if (newStatus === OrderStatuses.ACCEPTED) {
                    return setStatus(orderId, newStatus);
                }

                break;

            case OrderStatuses.ACCEPTED:
                if (newStatus === OrderStatuses.SENT) {
                    return setStatus(orderId, newStatus);
                }

                break;

            case OrderStatuses.SENT:
                if (newStatus === OrderStatuses.RECEIVED) {
                    return setStatus(orderId, newStatus);
                }

                break;

            default:
                throw new BadRequestError("Sorry, the status of this order has already been completed");
        }

        throw new BadRequestError("Logic mismatch: sorry, you cannot set this status");
    }
}

/**
 * Returns updated order
 * @param orderId The id of an order, in which a status changes
 * @param status The new status
 * @throws NotFoundError exception if order doesn't exist in database (from ensureItemExists() method)
 */
async function setStatus(orderId: string, status: string): Promise<IOrder> {
    await ensureItemExists(Order, '_id', orderId);
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' }) as IOrder;
    mailController.sendMail(updatedOrder.email, 'Lumen Online Store: status change',
        `The status of your order has been changed to '${status}'. Go to the order page for more details.`);
    return updatedOrder;
}