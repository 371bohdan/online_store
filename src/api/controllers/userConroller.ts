import { Request, Response } from "express";
import asyncHandler from "../middleware/errors/asyncHandler";
import { userService } from "../services/userService";

export const userController = {
    changeRole: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { role } = req.body;
        const updatedUser = await userService.changeRole(id, role);
        res.json(updatedUser);
    }),

    getAllRoles: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const roles = userService.getAllRoles();
        res.json({ roles });
    })
}