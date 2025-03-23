import { Request, Response, NextFunction } from "express";
import { jwtService } from "../../services/auxiliary/jwtService";
import { UserRoles } from "../../models/enums/userRolesEnum";
import AccessDeniedError from "../../errors/auth/AccessDeniedError";
import errorHandler from "../errors/errorHandler";

export const requireOwnerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await jwtService.getUserFromBearerToken(req.headers.authorization);
        if (user.role !== UserRoles.OWNER) {
            throw new AccessDeniedError();
        }

        return next();

    } catch (error) {
        errorHandler(error, req, res, next);
    }
}