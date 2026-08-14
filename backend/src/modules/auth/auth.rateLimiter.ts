import createKeyedLimiter from "../../utils/rateLimiter";
import AppError from "../../errors/AppError";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const ipBasedOtpLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 5,
    max: 20,
    message: "too many requests, try again later"
})

const phoneBasedOtpLimiter = rateLimit({
    windowMs: 1000 * 60 * 5,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.body.phone,
    handler: (req: Request, res: Response, next: NextFunction) => {
        throw new AppError("you're sending too many requests, slow down", 429)
    }
});

export {
    ipBasedOtpLimiter,
    phoneBasedOtpLimiter
}