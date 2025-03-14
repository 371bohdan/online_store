import { Request, Response } from "express";
import { stripeService } from "./stripeService";
import asyncHandler from "../../api/middleware/errors/asyncHandler";

export const stripeController = {
    createPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { productName, price, orderId } = req.body;
        const checkoutSession = await stripeService.createCheckoutSession(productName, price, orderId);
        res.json({ uri: checkoutSession.url });
    })
}