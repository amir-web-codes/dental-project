import createKeyedLimiter from "../../utils/rateLimiter";

const requestVerificationLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 60 * 24,
    max: 5,
    message: "you can only request verification a limited number of times per day"
});

export {
    requestVerificationLimiter
}