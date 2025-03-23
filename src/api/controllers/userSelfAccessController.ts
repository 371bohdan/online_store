import { Request, Response } from "express";
import asyncHandler from "../middleware/errors/asyncHandler";
import { userSelfAccessService } from "../services/userSelfAccessService";

export const userSelfAccessController = {

    getProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const bearerToken = req.headers.authorization as string;
        const userProfile = await userSelfAccessService.getProfile(bearerToken);
        res.json(userProfile);
    }),

    updateProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const bearerToken = req.headers.authorization as string;
        const updatedUserProfile = await userSelfAccessService.updateProfile(bearerToken, req.body);
        res.json(updatedUserProfile);
    }),

    getCart: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const bearerToken = req.headers.authorization as string;
        const cart = await userSelfAccessService.getCart(bearerToken);
        res.json(cart);
    }),

    getOrders: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const bearerToken = req.headers.authorization as string;
        const orders = await userSelfAccessService.getOrders(bearerToken);
        res.json(orders);
    })
}