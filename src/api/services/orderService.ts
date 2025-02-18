import { HydratedDocument, Document, ModifyResult } from "mongoose";
import Order, { IOrder } from "../models/orders";
import Product, { IProduct } from "../models/products";
import Cart from "../models/carts";
import mailController from "../../config/mail/mailController";
import UnauthorizedError from "../errors/auth/UnauthorizedError";
import NotFoundError from "../errors/general/NotFoundError";
import { OrderItem } from "../types/OrderTypes";
import { OrderStatuses } from "../models/enums/orderStatusesEnum";
import { ensureItemExists, getItemByField } from "./genericCrudService";
import BadRequestError from "../errors/general/BadRequestError";
import mailController from "../../config/mail/mailController";

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
            throw new UnauthorizedError("Email is required for non-registered users.");
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
    }
};