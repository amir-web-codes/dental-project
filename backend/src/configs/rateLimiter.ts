import AppError from "../errors/AppError"
import type { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"
import createKeyedLimiter from "../utils/rateLimiter";

const globalRateLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 10,
    max: 300,
    message: "you're sending too many requests, slow down"
});

const adminVerificationLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 10,
    max: 50,
    message: "too many verification actions, slow down"
});

export {
    globalRateLimiter,
    adminVerificationLimiter
}