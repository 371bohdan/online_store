import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JsonWebTokenError } from "jsonwebtoken";
import { getErrorResponse } from "../../errors/ErrorResponse";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const message = error.message || 'Internal server error';
    let statusCode = error.statusCode || 500;

    if (message.startsWith('Cast to ObjectId failed')) {
        statusCode = StatusCodes.BAD_REQUEST;
        res.status(statusCode).json(getErrorResponse(statusCode, message, undefined, 23));
        return;
    }

    if (message.includes('already used')) {
        statusCode = StatusCodes.BAD_REQUEST;
    }

    if (message.startsWith('User validation failed')) {
        statusCode = StatusCodes.BAD_REQUEST;
    }

    if (error instanceof JsonWebTokenError) {
        statusCode = StatusCodes.UNAUTHORIZED;
    }

    res.status(statusCode).send(getErrorResponse(statusCode, message));
}

export default errorHandler;