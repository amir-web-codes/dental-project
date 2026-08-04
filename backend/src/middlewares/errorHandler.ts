import { NextFunction, Request, Response } from "express";
import logger from "../configs/logger";
import AppError from "../errors/AppError";

async function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {

    let status;
    let message;
    let stack
    let errors;
    if (err instanceof AppError) {
        status = err.status
        message = err.message
        stack = err.stack
        errors = err.errors
    } else {
        status = 500
        message = "internal server error"
        stack = undefined
        errors = undefined
    }

    const context = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        status,
        message,
        stack,
        errors
    }

    if (status >= 500) {

        console.error(stack)
        logger.error(context)

    } else {
        logger.warn(context)
    }

    res.status(status).json({
        success: false,
        message: message,
        errors,
        requestId: req.requestId
    })

}

export default errorHandler