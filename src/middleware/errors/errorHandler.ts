import { NextFunction, Request, Response } from "express";
import { ApiError, ErrorResponse, NotFoundError } from "../../errors/ApiError";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { TokenExpiredError } from "jsonwebtoken";

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const message = err.message || 'Internal server error';
    const statusCode = err.statusCode || 500;

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

    if (err instanceof NotFoundError) {
        res.status(statusCode).json(getErrorResponse(statusCode, message));
        return;
    }

    if (err instanceof TokenExpiredError) {
        const statusCode = StatusCodes.UNAUTHORIZED;
        res.status(statusCode).json(getErrorResponse(statusCode, err.message));
        return;
    }

    res.status(statusCode).send(message);
}

/**
 * Returns detailed error data (including error title, status code, message and date/time)
 * @param statusCode The http status code of the error
 * @param message The error message, which usually contains all the necessary information about the error and why it occurred.
 * @param title The error title (usually equal to the status code title). If this value is not specified, the title takes the value 
 * from the message (the data before the colon (':' symbol), if the colon doesn't exist, the title takes the value from the status code title).
 * @param endOfTitleIndex Index showing where the title ends in the message. Required for cases where the title exists in the message (and knows exactly 
 * how many characters it takes), but is not separated by the colon (':' symbol). If this value is not specified, the function will work with the required fields.
 */
function getErrorResponse(statusCode: number, message: string, title?: string, endOfTitleIndex?: number): ErrorResponse {
    if (endOfTitleIndex !== undefined) {
        title = message.substring(0, endOfTitleIndex);
        const text = message.substring(endOfTitleIndex + 1, message.length);
        return new ErrorResponse(title, statusCode, text);
    }

    let text;
    if (message.includes(':')) {
        const index = message.indexOf(':');
        if (title === undefined) {
            title = message.substring(0, index);
        }

        text = message.substring(index + 1, message.length).trim();
    } else {
        title = getReasonPhrase(statusCode);
        text = message;
    }

    return new ErrorResponse(title, statusCode, text);
}

export default errorHandler;