import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import asyncHandler from "../middleware/errors/asyncHandler";
// import { AuthRequest } from "../types/AuthRequest"// Імпортуй новий тип
import { IOrder } from "../models/orders"

const orderController = {
    createOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = req.body.user;
        const order = await orderService.createOrder(req.body, user);
        res.status(201).json(order);
    }),

    getAllStatuses: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const statuses = orderService.getAllStatuses();
        res.json({ statuses });
    }),

    changeStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const orderId = req.params.id;
        const newStatus = req.body.status;
        const updatedOrder = await orderService.changeStatus(orderId, newStatus);
        res.json(updatedOrder);
    })
};

export default orderController;
