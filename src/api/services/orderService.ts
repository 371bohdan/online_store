import { HydratedDocument, Document, ModifyResult } from "mongoose";
import Order, { IOrder } from "../models/orders";
import Cart from "../models/carts";
import NotFoundError from "../errors/general/NotFoundError";
import { OrderStatuses } from "../models/enums/orderStatusesEnum";
import { ensureItemExists, getItemByField } from "./genericCrudService";
import BadRequestError from "../errors/general/BadRequestError";
import mailController from "../../config/mail/mailController";

export const orderService = {
    createOrder: async (body: any): Promise<HydratedDocument<IOrder>> => {
        const {
            cartId,
            deliveryCompanyId,
            firstName,
            lastName,
            telephone,
            email
        } = body;


        const cart = await Cart.findById(cartId);

        if (!cart) {
            throw new NotFoundError(Order.modelName);
        }

        const userId = cart.userId || null;


        const order = new Order({
            userId,
            cartId: cart._id,
            deliveryCompanyId,
            firstName,
            lastName,
            telephone,
            email,
            amountOrder: cart.totalPrice,
        });

        // Зберегти замовлення в базу даних
        return await order.save();
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