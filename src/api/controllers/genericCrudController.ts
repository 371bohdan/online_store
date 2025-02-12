import { Request, Response } from "express";

import { genericCrudService } from "../services/genericCrudService";
import asyncHandler from "../middleware/errors/asyncHandler";
import { StatusCodes } from "http-status-codes";

const genericCrudController = (service: ReturnType<typeof genericCrudService>) => ({
    getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const items = await service.getAll();
        res.json(items);
    }),

    getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const item = await service.getById(id);
        res.json(item);
    }),

    create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const item = await service.create(req.body)
        res.status(StatusCodes.CREATED).json(item);
    }),

    update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const updatedItem = await service.update(id, req.body)
        res.json(updatedItem);
    }),

    removeById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const message = await service.removeById(id);
        res.json({ message });
    }),

    removeAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        await service.removeAll();
        res.status(StatusCodes.NO_CONTENT);
    })
})



export default genericCrudController;