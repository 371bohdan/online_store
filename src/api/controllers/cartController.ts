import { Request, Response } from "express";
import { cartService } from "../services/cartService";
import asyncHandler from "../middleware/errors/asyncHandler";

const cartController = {
    addProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productId, quantity } = req.body;
        const bearerToken = req.headers.authorization;

        const createdCart = await cartService.addProduct(bearerToken, productId, quantity);
        res.json({ message: "Product added to cart successfully", createdCart });
    }),

    removeProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productId, quantity } = req.body;
        const bearerToken = req.headers.authorization;

        const cart = await cartService.removeProduct(bearerToken, productId, quantity);
        res.json({ message: "Product removed from cart successfully", cart });
    })
};

export default cartController;
