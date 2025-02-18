class UnauthorizedError extends Error {
    statusCode: number;

    constructor(message = "Unauthorized access") {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
    }
}

export default UnauthorizedError;