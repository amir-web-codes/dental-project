import type { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"

const OtpLimiter = rateLimit({
    windowMs: 1000 * 60 * 5,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction) => {
        res.status(429).json({
            success: false,
            message: "too many requests, try again later"
        })
    }
})

export {
    OtpLimiter
}