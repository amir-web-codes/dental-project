import { NextFunction, Request, Response } from "express";
import logger from "../configs/logger";
import AppError from "../errors/AppError";
import { ZodError } from "zod";

async function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    let status: number;
    let message: string;
    let stack: string | undefined;
    let errors: unknown;

    if (err instanceof AppError) {
        status = err.status;
        message = err.message;
        stack = err.stack;
        errors = err.errors;
    } else if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON"
        });
    } else if (err instanceof ZodError) {
        status = 400
        message = "invalid inputs"
        stack = undefined
        errors = err.issues
    } else {
        status = 500;
        message = "internal server error";
        stack = err instanceof Error ? err.stack : String(err);
        errors = undefined;
    }

    const context = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        userRole: req.user?.role,
        userAgent: req.headers["user-agent"],
        status,
        message,
        stack,
        errors
    };

    if (status >= 500) {
        logger.error(context);
        console.log(stack)
    } else {
        logger.warn(context);
    }

    res.status(status).json({
        success: false,
        message,
        errors,
        requestId: req.requestId
    });
}

export default errorHandler;