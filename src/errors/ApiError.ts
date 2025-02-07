import { StatusCodes } from "http-status-codes";

class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
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

class AuthorizationError extends ApiError {
    constructor(message: string) {
        const statusCode = StatusCodes.UNAUTHORIZED;
        super(statusCode, message);
    }
}

class AccessDeniedError extends ApiError {
    constructor() {
        const statusCode = StatusCodes.FORBIDDEN;
        const message = "You don't have access to interact with this route";
        super(statusCode, message);
    }
}

export { ApiError, NotFoundError, ValidationError, AuthorizationError, AccessDeniedError };