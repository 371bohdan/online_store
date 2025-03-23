import { NextFunction, Request, Response } from "express";
import { jwtService } from "../../services/auxiliary/jwtService";
import { JwtTokenTypes } from "../../models/enums/jwtTokenTypesEnum";
import errorHandler from "../errors/errorHandler";

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = jwtService.getJwtTokenWithoutAuthScheme(req.headers.authorization);
        if (jwtService.isValidJwtToken(token, JwtTokenTypes.ACCESS)) {
            next();
        }
    } catch (error) {
        errorHandler(error, req, res, next);
    }
}

export default requireAuth;