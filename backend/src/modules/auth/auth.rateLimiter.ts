import createKeyedLimiter from "../../utils/rateLimiter";

const OtpLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 5,
    max: 20,
    message: "too many requests, try again later"
})

export {
    OtpLimiter
}