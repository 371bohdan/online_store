import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

class MissingParameterError extends ApiError {
    constructor(parameterName?: string, message?: string) {
        if (parameterName && !message) {
            message = `The '$${parameterName}' parameter is missing`;
        } else if ((!parameterName && !message) || !message) {
            message = 'One or more of the required parameters are missing';
        }

        const statusCode = StatusCodes.BAD_REQUEST;
        super(statusCode, message);
    }
}

export default MissingParameterError;