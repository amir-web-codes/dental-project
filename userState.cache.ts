import { redisClient } from "./backend/src/configs/redis";
import logger from "./backend/src/configs/logger";

export interface UserStateCache {
    status: "ACTIVE" | "BANNED" | "DELETED";
    banExpiresAt: string | null;
    banReason: string | null;
    profileCompleted: boolean;
    role: "USER" | "DENTIST" | "ADMIN";
}

const TTL_SECONDS = 60;
const keyFor = (userId: string) => `user:state:${userId}`;

export async function getUserStateCache(userId: string): Promise<UserStateCache | null> {
    try {
        const raw = await redisClient.get(keyFor(userId));
        if (!raw) return null;
        return JSON.parse(raw) as UserStateCache;
    } catch (err) {
        logger.warn({
            message: "redis get failed for user state cache",
            userId,
            error: err instanceof Error ? err.message : String(err)
        });
        return null;
    }
}

export async function setUserStateCache(userId: string, state: UserStateCache): Promise<void> {
    try {
        await redisClient.set(keyFor(userId), JSON.stringify(state), { EX: TTL_SECONDS });
    } catch (err) {
        logger.warn({
            message: "redis set failed for user state cache",
            userId,
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function invalidateUserStateCache(userId: string): Promise<void> {
    try {
        await redisClient.del(keyFor(userId));
    } catch (err) {
        logger.warn({
            message: "redis del failed for user state cache",
            userId,
            error: err instanceof Error ? err.message : String(err)
        });
    }
}