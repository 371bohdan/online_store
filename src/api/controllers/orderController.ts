import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import asyncHandler from "../middleware/errors/asyncHandler";

const orderController = {
    createOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ message: 'Order created successfully', order });
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
}

export default orderController;