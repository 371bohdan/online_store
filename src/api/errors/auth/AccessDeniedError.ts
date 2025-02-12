import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

class AccessDeniedError extends ApiError {
    constructor(message: string = "You don't have access to interact with this route") {
        const statusCode = StatusCodes.FORBIDDEN;
        super(statusCode, message);
    }
}

export default AccessDeniedError;