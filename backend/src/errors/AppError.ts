export default class AppError extends Error {
    status: number;
    errors: unknown

    constructor(message: string, status: number, errors?: unknown) {
        super(message)
        this.status = status
        this.errors = errors

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}