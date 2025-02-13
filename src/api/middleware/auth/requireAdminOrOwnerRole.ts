import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../../models/enums/userRolesEnum";
import { jwtService } from "../../services/auxiliary/jwtService";
import AccessDeniedError from "../../errors/auth/AccessDeniedError";

const requireAdminOrOwnerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await jwtService.getUserFromBearerToken(req.headers.authorization);
        if (user.role === UserRoles.ADMIN || user.role === UserRoles.OWNER) {
            return next();
        }

        throw new AccessDeniedError();

    } catch (error) {
        next(error);
    }
}

export default requireAdminOrOwnerRole;