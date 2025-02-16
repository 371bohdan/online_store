import { NextFunction, Request, Response } from "express";
import { jwtService } from "../../services/auxiliary/jwtService";
import { JwtTokenTypes } from "../../models/enums/jwtTokenTypesEnum";

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = jwtService.getJwtTokenWithoutAuthScheme(req.headers.authorization);
        if (jwtService.isValidJwtToken(token, JwtTokenTypes.ACCESS)) {
            next();
        }
    } catch (error) {
        next(error);
    }
}

export default requireAuth;