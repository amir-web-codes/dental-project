import createKeyedLimiter from "../utils/rateLimiter";

const globalRateLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 10,
    max: 300,
    message: "you're sending too many requests, slow down"
});

export {
    globalRateLimiter
}