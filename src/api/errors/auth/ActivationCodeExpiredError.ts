import { StatusCodes } from "http-status-codes";
import ApiError from "../ApiError";

export class ActivationCodeExpiredError extends ApiError {
    constructor(message: string = 'The time of the given activation code has expired. Please, request a new one') {
        const statusCode = StatusCodes.BAD_REQUEST;
        super(statusCode, message);
    }
}