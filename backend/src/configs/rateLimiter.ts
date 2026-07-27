import type { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"

export default rateLimit({
    windowMs: 1000 * 60 * 10,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction) => {
        res.status(429).json({
            success: false,
            message: "you're sending too many requests, slow down"
        })
    }
})