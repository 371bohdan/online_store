import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JsonWebTokenError } from "jsonwebtoken";
import { getErrorResponse } from "../../errors/ErrorResponse";
import { logger } from "../../../config/winston/winstonConfig";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const message = error.message || 'Internal server error';
    let statusCode = error.statusCode || 500;
    logging(error, message);

    if (message.startsWith('Cast to ObjectId failed')) {
        statusCode = StatusCodes.BAD_REQUEST;
        res.status(statusCode).json(getErrorResponse(statusCode, message, undefined, 23));
        return;
    }

    if (message.includes('already used') || message.startsWith('User validation failed')) {
        statusCode = StatusCodes.BAD_REQUEST;
    }

    if (error instanceof JsonWebTokenError) {
        statusCode = StatusCodes.UNAUTHORIZED;
    }

    res.status(statusCode).send(getErrorResponse(statusCode, message));
}

function logging(error: any, message: string) {
    logger.error(message, {
        service: 'errorHandler',
        stack: error.stack
    });
}

export default errorHandler;