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
import { jwtService } from "./auxiliary/jwtService";
import { convertToOrderDTO, OrderDTO } from "../dto/OrderDTO";
import { stripeService } from "../../config/stripe/stripeService";
import User, { IUser } from "../models/users";
import { getUserByEmail, isUserExistsByEmail } from "./userService";

export const orderService = {
    createOrder: async (body: { products: OrderItem[] } & any, bearerToken: string | undefined): Promise<OrderDTO> => {
        let user, products;

        if (bearerToken) {
            user = await jwtService.getUserFromBearerToken(bearerToken);

            if (await Cart.exists({ userId: user.id })) {
                products = (await Cart.findOne({ userId: user.id }))?.products;
            }
        }

        if (!products) {
            products = body.products;
        }

        const {
            deliveryCompanyId,
            firstName,
            lastName,
            phoneNumber,
            email,
            paymentMethod
        } = body;

        if (!user && !email) {
            throw new AuthorizationError("Email is required for non-registered users.");
        }

        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.productId);

            if (!product) throw new NotFoundError(`Product with ID ${item.productId} not found`);
            if (item.quantity <= 0) throw new BadRequestError('Quantity of product cannot be 0 or less');
            if (product.stock - item.quantity < 0) throw new BadRequestError(`We don't have the '${product.title}' product in stock in ${item.quantity} quantity`)

            totalAmount += product.price * item.quantity;
        }

        let orderData: Partial<IOrder> = {
            deliveryCompanyId,
            firstName,
            lastName,
            phoneNumber,
            email: email ? email : user?.email,
            products,
            amountOrder: totalAmount,
            paymentMethod
        };

        const order = new Order(orderData);

        if (user) {
            await Cart.findOneAndUpdate({ userId: user._id }, { products: [], totalPrice: 0 });
            order.userId = user.id;

        } else if (await isUserExistsByEmail(email)) {
            order.userId = (await getUserByEmail(email)).id;
        }

        const savedOrder = await order.save();

        // Оновлення запасів товарів
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Відправка email з деталями замовлення
        const orderDetails = {
            firstName,
            lastName,
            phoneNumber,
            email,
            products,
            amountOrder: totalAmount
        };

        mailController.sendOrderConfirmation(orderData.email as string, orderDetails);
        return convertToOrderDTO(savedOrder);
    },

    getAllStatuses: (): Array<OrderStatuses> => {
        return Object.values(OrderStatuses);
    },

    changeStatus: async (orderId: string, newStatus: string): Promise<OrderDTO> => {
        const currentStatus = (await getItemByField(Order, '_id', orderId)).status;

        if (!Object.values(OrderStatuses).includes(newStatus as OrderStatuses)) {
            throw new BadRequestError("This status doesn't exist")
        }

        if (newStatus === OrderStatuses.CANCELED && currentStatus !== OrderStatuses.RECEIVED) {
            return convertToOrderDTO(await setStatus(orderId, newStatus));
        }

        switch (currentStatus as OrderStatuses) {
            case OrderStatuses.PROCESSING:
                if (newStatus === OrderStatuses.ACCEPTED) {
                    const updatedOrder = await setStatus(orderId, newStatus);
                    return convertToOrderDTO(updatedOrder);
                }

                break;

            case OrderStatuses.ACCEPTED:
                if (newStatus === OrderStatuses.SENT) {
                    const updatedOrder = await setStatus(orderId, newStatus);
                    return convertToOrderDTO(updatedOrder);
                }

                break;

            case OrderStatuses.SENT:
                if (newStatus === OrderStatuses.RECEIVED) {
                    const updatedOrder = await setStatus(orderId, newStatus);
                    return convertToOrderDTO(updatedOrder);
                }

                break;

            default:
                throw new BadRequestError("Sorry, the status of this order has already been completed");
        }

        throw new BadRequestError("Logic mismatch: sorry, you cannot set this status");
    },

    successfulPayment: async (sessionId: string): Promise<OrderDTO> => {
        const session = await stripeService.retrieveStripeSessionById(sessionId);
        const orderId = session.metadata?.orderId;
        await ensureItemExists(Order, '_id', orderId);
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { returnDocument: 'after' }) as IOrder;
        return convertToOrderDTO(updatedOrder);
    },

    unsuccessfulPayment: async (sessionId: string): Promise<OrderDTO> => {
        const session = await stripeService.retrieveStripeSessionById(sessionId);
        const orderId = session.metadata?.orderId;
        const order = await getItemByField(Order, '_id', orderId);
        return convertToOrderDTO(order);
    }
}

/**
 * Returns updated order
 * @param orderId The id of an order, in which a status changes
 * @param status The new status
 * @throws NotFoundError exception if order doesn't exist in database (from ensureItemExists() method)
 */
async function setStatus(orderId: string, status: OrderStatuses): Promise<IOrder> {
    await ensureItemExists(Order, '_id', orderId);
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' }) as IOrder;

    mailController.sendOrderStatusChangedLetter(updatedOrder.email, status);
    return updatedOrder;
}

/**
 * Attaches user to his orders (point: if user ordered as a guest (without authentication), but later he created an account 
 * and this method will attach his order to his account)
 * @param user The user
 */
export async function attachUserToHisOrders(user: IUser): Promise<void> {
    await ensureItemExists(User, '_id', user._id);
    const orders = await Order.find({ email: user.email, userId: undefined });

    if (orders.length > 0) {
        orders.map(async order => await Order.findByIdAndUpdate(order._id, { userId: user._id }))
    }
}