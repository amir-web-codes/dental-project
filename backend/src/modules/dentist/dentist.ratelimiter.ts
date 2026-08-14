import createKeyedLimiter from "../../utils/rateLimiter";

const requestVerificationLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 60 * 24,
    max: 5,
    message: "you can only request verification a limited number of times per day"
});

const adminVerificationLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 10,
    max: 50,
    message: "too many verification actions, slow down"
});

export {
    requestVerificationLimiter,
    adminVerificationLimiter
}