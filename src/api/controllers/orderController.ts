import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import asyncHandler from "../middleware/errors/asyncHandler";

const orderController = {
    createOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const bearerToken = req.headers.authorization;
        const order = await orderService.createOrder(req.body, bearerToken);
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
    }),

    successfulPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const sessionId = req.query.session_id as string;
        const orderDto = await orderService.successfulPayment(sessionId);
        res.json(orderDto);
    }),

    unsuccessfulPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const sessionId = req.query.session_id as string;
        const orderDto = await orderService.unsuccessfulPayment(sessionId);
        res.json(orderDto);
    }),

    statistics: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { startDate, endDate } = req.query;
        const orderStatDto = await orderService.getStatistics(startDate as string, endDate as string);
        res.json(orderStatDto);
    })
};

export default orderController;
