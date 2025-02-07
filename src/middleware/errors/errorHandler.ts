import { NextFunction, Request, Response } from "express";
import { ApiError, NotFoundError } from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { JsonWebTokenError } from "jsonwebtoken";
import { getErrorResponse } from "../../errors/errorResponse";

const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction) => {
    const message = error.message || 'Internal server error';
    let statusCode = error.statusCode || 500;

    if (message.startsWith('Cast to ObjectId failed')) {
        const statusCode = StatusCodes.BAD_REQUEST;
        res.status(statusCode).json(getErrorResponse(statusCode, message, undefined, 23));
        return;
    }

    if (message.startsWith('User validation failed')) {
        const statusCode = StatusCodes.BAD_REQUEST;
        res.status(statusCode).json(getErrorResponse(statusCode, message));
        return;
    }

    if (error instanceof NotFoundError) {
        res.status(statusCode).json(getErrorResponse(statusCode, message));
        return;
    }

    if (error instanceof JsonWebTokenError) {
        statusCode = StatusCodes.UNAUTHORIZED;
    }

    res.status(statusCode).send(getErrorResponse(statusCode, message));
}

export default errorHandler;