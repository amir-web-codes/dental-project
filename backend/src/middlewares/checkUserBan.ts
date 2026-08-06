import type { Request, Response, NextFunction } from "express";
import prisma from "../configs/prisma";
import AppError from "../errors/AppError";
import logger from "../configs/logger";
import {
    getUserStateCache,
    setUserStateCache,
    invalidateUserStateCache,
    UserStateCache
} from "../utils/userState.cache";
import { restoreDentistProfileIfSuspended } from "../modules/user/dentist/dentist.service";

async function loadState(userId: string): Promise<UserStateCache> {
    let state = await getUserStateCache(userId);
    if (state) return state;

    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            status: true,
            banExpiresAt: true,
            banReason: true,
            profileCompleted: true,
            role: true
        }
    });

    if (!dbUser) {
        throw new AppError("user not found", 404);
    }

    state = {
        status: dbUser.status,
        banExpiresAt: dbUser.banExpiresAt ? dbUser.banExpiresAt.toISOString() : null,
        banReason: dbUser.banReason,
        profileCompleted: dbUser.profileCompleted,
        role: dbUser.role
    };

    await setUserStateCache(userId, state);
    return state;
}

export default async function checkUserBan(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError("token not provided", 401);
    }

    const state = await loadState(userId);

    if (state.status === "DELETED") {
        throw new AppError("this account no longer exists", 403);
    }

    if (state.status === "BANNED") {
        const expiresAt = state.banExpiresAt ? new Date(state.banExpiresAt) : null;
        const isExpired = expiresAt !== null && expiresAt.getTime() <= Date.now();

        if (!isExpired) {
            throw new AppError("your account has been banned", 403, {
                permanent: expiresAt === null,
                reason: state.banReason ?? "no reason",
                expiresAt: expiresAt ? expiresAt.toISOString() : null
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.updateMany({
                where: { id: userId, status: "BANNED" },
                data: {
                    status: "ACTIVE",
                    banExpiresAt: null,
                    banReason: null,
                    bannedAt: null,
                    bannedById: null,
                    unbannedAt: new Date(),
                    unbannedById: null
                }
            });

            await restoreDentistProfileIfSuspended(userId, tx);
        });

        await invalidateUserStateCache(userId);

        logger.info({
            message: "user auto-unbanned after ban expiration",
            userId
        });

        return next();
    }

    next();
}