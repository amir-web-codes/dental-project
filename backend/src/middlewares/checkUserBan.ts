import type { Request, Response, NextFunction } from "express";
import prisma from "../configs/prisma";
import AppError from "../errors/AppError";
import logger from "../configs/logger";
import loadState from "../utils/cache/loadUserState"
import { invalidateUserStateCache } from "../utils/cache/userState.cache";
// import { restoreDentistProfileIfSuspended } from "../modules/user/dentist/dentist.service";

export default async function checkUserBan(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError("token not provided", 401);
    }

    const state = await loadState(userId);

    if (state.status === "DELETED") {
        throw new AppError("this account no longer exists(DELETED)", 403);
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

            // await restoreDentistProfileIfSuspended(userId, tx);
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