import prisma from "../../configs/prisma"
import AppError from "../../errors/AppError"
import {
    getUserStateCache,
    setUserStateCache,
    invalidateUserStateCache,
    UserStateCache
} from "./userState.cache";

export default async function loadState(userId: string): Promise<UserStateCache> {
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