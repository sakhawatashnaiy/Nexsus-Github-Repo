export class ApiError extends Error {
    statusCode;
    errors;
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
