import { NextFunction, Request, Response } from "express";
import { getJwtTokenWithoutAuthScheme, isValidAccessToken } from "../../controllers/authController";

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = getJwtTokenWithoutAuthScheme(req.headers.authorization);
        if (isValidAccessToken(token)) {
            next();
        }
    } catch (error) {
        next(error);
    }
}

export default requireAuth;