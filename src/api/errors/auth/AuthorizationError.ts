import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

class AuthorizationError extends ApiError {
    constructor(message: string) {
        const statusCode = StatusCodes.UNAUTHORIZED;
        super(statusCode, message);
    }
}

export default AuthorizationError;