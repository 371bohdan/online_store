import mongoose from "mongoose";
import Cart from "../models/carts";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/general/NotFoundError";
import Product from "../models/products";
import { jwtService } from "./auxiliary/jwtService";
import { ensureItemExists } from "./genericCrudService";
import ValidationError from "../errors/validation/ValidationError";
import { CartDTO, convertToCartDTO } from "../dto/CartDTO";

export const cartService = {
    addProduct: async (bearerToken: string | undefined, productId: mongoose.Types.ObjectId, quantity: number): Promise<CartDTO> => {

        if (!productId || !quantity) {
            throw new ValidationError('ProductId, and quantity are required');
        }

        const user = await jwtService.getUserFromBearerToken(bearerToken);
        await ensureItemExists(Product, '_id', productId);

        // Знайти кошик користувача
        let cart = await Cart.findOne({ userId: user.id });

        if (!cart) {
            // Якщо кошик не існує, створити новий
            cart = new Cart({ userId: user.id, products: [{ productId, quantity }] });
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
        const savedCart = await cart.save();
        return convertToCartDTO(savedCart);
    },

    removeProduct: async (bearerToken: string | undefined, productId: string, quantity: number): Promise<CartDTO> => {

        if (!productId) {
            throw new ValidationError('ProductId is required');
        }

        if (quantity < 0) {
            throw new ValidationError('Quantity cannot be negative');
        }

        // Встановити значення за замовчуванням для quantity, якщо воно не вказане
        const removeQuantity = quantity || 1;
        const user = await jwtService.getUserFromBearerToken(bearerToken);

        const cart = await Cart.findOne({ userId: user.id });

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
        const savedCart = await cart.save();
        return convertToCartDTO(savedCart);
    }
}