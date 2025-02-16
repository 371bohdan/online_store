import ApiError from "../ApiError";

class ImageUploadError extends ApiError {
    constructor(statusCode: number, message: string) {
        super(statusCode, message);
    }
}

export default ImageUploadError;