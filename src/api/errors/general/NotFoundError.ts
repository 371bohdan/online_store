import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

class NotFoundError extends ApiError {
    constructor(modelName: string) {
        const statusCode = StatusCodes.NOT_FOUND;
        const message = `Not found error: the ${modelName.toLowerCase()} not found.`;
        super(statusCode, message);
    }
}

export default NotFoundError;