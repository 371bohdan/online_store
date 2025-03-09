import { Request, Response } from "express";
import ValidationError from "../errors/validation/ValidationError";
import { cartService } from "../services/cartService";
import asyncHandler from "../middleware/errors/asyncHandler";

const cartController = {
    addProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productId, quantity } = req.body;
        const bearerToken = req.headers.authorization;

        if (!productId || !quantity) {
            throw new ValidationError('ProductId, and quantity are required');
        }

        const createdCart = await cartService.addProduct(bearerToken, productId, quantity);
        res.json({ message: "Product added to cart successfully", createdCart });
    }),

    removeProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productId, quantity } = req.body;
        const bearerToken = req.headers.authorization;

        if (!productId) {
            throw new ValidationError('ProductId is required');
        }

        if (quantity < 0) {
            throw new ValidationError('Quantity cannot be negative');
        }

        const cart = await cartService.removeProduct(bearerToken, productId, quantity);
        res.json({ message: "Product removed from cart successfully", cart });
    })
};

export default cartController;
