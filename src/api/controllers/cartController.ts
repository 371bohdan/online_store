import { Request, Response } from "express";
import ValidationError from "../errors/validation/ValidationError";
import { cartService } from "../services/cartService";
import asyncHandler from "../middleware/errors/asyncHandler";

const cartController = {
    addProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productId, quantity, userId } = req.body;
        if (!productId || !quantity) {
            throw new ValidationError('ProductId, and quantity are required');
        }

        const createdCart = await cartService.addProduct(productId, quantity, userId);
        res.json({ message: "Product added to cart successfully", createdCart });
    }),

    removeProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { userId, productId, quantity } = req.body;
        if (!userId) {
            throw new ValidationError('userId is required');
        }

        if (!productId) {
            throw new ValidationError('ProductId is required');
        }

        if (quantity < 0) {
            throw new ValidationError('Quantity cannot be negative');
        }

        const cart = await cartService.removeProduct(userId, productId, quantity);
        res.json({ message: "Product removed from cart successfully", cart });
    })
};

export default cartController;
