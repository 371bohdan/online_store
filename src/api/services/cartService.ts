import mongoose, { HydratedDocument } from "mongoose";
import Cart, { ICart } from "../models/carts";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/general/NotFoundError";
import Product from "../models/products";

export const cartService = {
    addProduct: async (productId: mongoose.Types.ObjectId, quantity: number, userId: string): Promise<HydratedDocument<ICart>> => {
        // Знайти кошик користувача
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Якщо кошик не існує, створити новий
            cart = new Cart({ userId, products: [{ productId, quantity }] });
        } else {
            // Перевірити, чи товар вже є в кошику
            const productIndex = cart.products.findIndex(
                (product) => product.productId.toString() === productId.toString()
            );

            if (productIndex > -1) {
                // Оновити кількість товару
                cart.products[productIndex].quantity += quantity;
            } else {
                // Додати новий товар
                cart.products.push({ productId, quantity });
            }
        }

        // Зберегти кошик
        return await cart.save();
    },

    removeProduct: async (userId: string, productId: string, quantity: number): Promise<HydratedDocument<ICart>> => {
        // Встановити значення за замовчуванням для quantity, якщо воно не вказане
        const removeQuantity = quantity || 1;


        const cart = await Cart.findOne({ userId });

        if (!cart || !cart.products || cart.products.length === 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'The cart is empty!');
        }

        const productIndex = cart.products.findIndex(
            (product) => product.productId.toString() === productId
        );

        if (productIndex > -1) {
            // Зменшити кількість товару
            cart.products[productIndex].quantity -= removeQuantity;
            if (cart.products[productIndex].quantity <= 0) {
                cart.products.splice(productIndex, 1);
            }
        } else {
            throw new NotFoundError(Product.modelName);
        }

        // Зберегти кошик
        return await cart.save();

    }
}