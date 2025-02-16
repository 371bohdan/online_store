import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

class BadRequestError extends ApiError {
    constructor(message: string) {
        const statusCode = StatusCodes.BAD_REQUEST;
        super(statusCode, message);
    }
}

export default BadRequestError;