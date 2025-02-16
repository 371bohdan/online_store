import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import asyncHandler from "../middleware/errors/asyncHandler";
import { AuthRequest } from "../types/AuthRequest"// Імпортуй новий тип

const orderController = {
    createOrder: asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const user = req.user; 
        const order = await orderService.createOrder(req.body, user);
        res.status(201).json(order);
    })
};

export default orderController;
