import { NextFunction, Request, Response } from "express";
import { getUserIdFromJwtToken, getJwtTokenWithoutAuthScheme } from "../../controllers/authController";
import User from "../../models/users";
import { UserRoles } from "../../models/enums/userRolesEnum";
import { AccessDeniedError } from "../../errors/ApiError";

const requireAdminOrOwnerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = getJwtTokenWithoutAuthScheme(req.headers.authorization);
        const userId = getUserIdFromJwtToken(token);
        const user = await User.findById(userId);

        if (user?.role === UserRoles.ADMIN || user?.role === UserRoles.OWNER) {
            return next();
        }

        throw new AccessDeniedError();

    } catch (error) {
        next(error);
    }
}

export default requireAdminOrOwnerRole;