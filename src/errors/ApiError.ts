import { StatusCodes } from "http-status-codes";

class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ErrorResponse {
    title: string;
    statusCode: number;
    message: string;
    date: string;

    constructor(title: string, statusCode: number, message: string) {
        this.title = title;
        this.statusCode = statusCode;
        this.message = message;
        const dateTime = new Date();
        this.date = dateTime.toLocaleDateString() + ', ' + dateTime.toLocaleTimeString();
    }
}

class NotFoundError extends ApiError {
    constructor(modelName: string) {
        const statusCode = StatusCodes.NOT_FOUND;
        const message = `Not found error: the ${modelName} not found.`;
        super(statusCode, message);
    }
}

class ValidationError extends ApiError {
    constructor(message: string) {
        const statusCode = StatusCodes.BAD_REQUEST;
        super(statusCode, message);
    }
}

export { ApiError, ErrorResponse, NotFoundError, ValidationError };