import { NextFunction, Request, Response } from "express";
import User from "../../models/users";
import { UserRoles } from "../../models/enums/userRolesEnum";
import { jwtService } from "../../services/auxiliary/jwtService";
import { JwtTokenTypes } from "../../models/enums/jwtTokenTypesEnum";
import AccessDeniedError from "../../errors/auth/AccessDeniedError";

const requireAdminOrOwnerRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = jwtService.getJwtTokenWithoutAuthScheme(req.headers.authorization);
        const userId = jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.ACCESS);
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