import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export default function checkRole(availableRoles: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && availableRoles.includes(req.user.role)) {
            return next();
        }
        throw new AppError("Forbidden request", 403);
    };
}