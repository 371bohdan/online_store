import { HydratedDocument } from "mongoose";
import Order, { IOrder } from "../models/orders";
import Cart from "../models/carts";
import NotFoundError from "../errors/general/NotFoundError";

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
    }
}