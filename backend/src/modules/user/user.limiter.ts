import createKeyedLimiter from "../../utils/rateLimiter";

const createRequestLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 60 * 24,
    max: 3,
    message: "you can only submit a limited number of role requests per day"
});

const reviewRequestLimiter = createKeyedLimiter({
    windowMs: 1000 * 60 * 10,
    max: 50,
    message: "too many review actions, slow down"
});

export {
    createRequestLimiter,
    reviewRequestLimiter
}