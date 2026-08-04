import { createClient } from "redis"
import env from "../utils/env"
import logger from "../configs/logger"

const redisClient = createClient({
    url: env("REDIS_URL")
})

redisClient.on("connect", () => {
    console.log("Redis connected");
});


redisClient.on("error", (err: unknown) => {
    console.error("Redis error:", err);

    logger.error({
        message: "redis connection failed",
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : String(err)
    })
});

async function connectRedis() {
    try {
        await redisClient.connect()
    } catch (err) {
        console.log(`redis connection error: ${err}`)
        process.exit(1)
    }
}

export { redisClient, connectRedis };