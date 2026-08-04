import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export default async function (availableRoles: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (availableRoles.includes(req.user.role)) {

            return next()
        } else {
            throw new AppError("Forbidden request", 403)
        }
    }
}