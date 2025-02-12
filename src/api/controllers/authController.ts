import { Request, Response } from "express";
import { authService } from "../services/authService";
import asyncHandler from "../middleware/errors/asyncHandler";
import { StatusCodes } from "http-status-codes";

export const authController = {
    signUp: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { password, email } = req.body;
        const message = await authService.signUp(email, password);
        res.json({ message })
    }),

    signIn: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { password, email } = req.body;
        const token = await authService.signIn(email, password, res);
        res.json({ token });
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { jwt } = req.cookies;
        const accessToken = await authService.refreshToken(jwt, res);
        res.json({ token: accessToken });
    }),

    logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { jwt } = req.cookies;
        await authService.logout(jwt, res);
        res.status(StatusCodes.NO_CONTENT).end();
    }),

    passwordRecovery: async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body;
        const message = await authService.passwordRecovery(email);
        res.json({ message });
    },

    confirmPasswordRecovery: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { password } = req.body;
        const recoveryCode = req.params.id;
        const message = await authService.confirmPasswordRecovery(recoveryCode, password);
        res.json(message);
    }),

    verifyEmail: async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const message = await authService.verifyEmail(id);
        res.json({ message })
    }
}