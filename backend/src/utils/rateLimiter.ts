import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

interface KeyedLimiterOptions {
    windowMs: number;
    max: number;
    message?: string;
}

export default function createKeyedLimiter(options: KeyedLimiterOptions) {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? "unknown",
        handler: (req: Request, res: Response, next: NextFunction) => {
            throw new AppError(options.message ?? "you're sending too many requests, slow down", 429)
        }
    });
}