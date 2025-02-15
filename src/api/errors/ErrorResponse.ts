import { getReasonPhrase } from "http-status-codes";

export class ErrorResponse {
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

/**
 * Returns detailed error data (including error title, status code, message and date/time)
 * @param statusCode The http status code of the error
 * @param message The error message, which usually contains all the necessary information about the error and why it occurred.
 * @param title The error title (usually equal to the status code title). If this value is not specified, the title takes the value 
 * from the message (the data before the colon (':' symbol), if the colon doesn't exist, the title takes the value from the status code title).
 * @param endOfTitleIndex Index showing where the title ends in the message. Required for cases where the title exists in the message (and knows exactly 
 * how many characters it takes), but is not separated by the colon (':' symbol). If this value is not specified, the function will work with the required fields.
 */
export function getErrorResponse(statusCode: number, message: string, title?: string, endOfTitleIndex?: number): ErrorResponse {
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