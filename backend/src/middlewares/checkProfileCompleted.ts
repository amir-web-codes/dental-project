import type { Request, Response, NextFunction } from "express";
import prisma from "../configs/prisma";
import AppError from "../errors/AppError";
import loadState from "../utils/cache/loadUserState";

export default async function checkProfileCompleted(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError("token not provided", 401);
    }

    const state = await loadState(userId)

    if (!state.profileCompleted) {
        throw new AppError("please complete your profile before continuing", 400);
    }

    next();
}