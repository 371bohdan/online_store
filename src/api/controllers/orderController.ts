import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import asyncHandler from "../middleware/errors/asyncHandler";

const orderController = {
    createOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ message: 'Order created successfully', order });
    })
}

export default orderController;