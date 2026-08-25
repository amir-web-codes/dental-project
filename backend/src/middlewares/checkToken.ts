import type { Request, Response, NextFunction } from "express";
import env from "../utils/env";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";
import type { JWTPayload } from "../types/auth";

export default function checkToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];

    if (!token) {
        throw new AppError("token not provided", 401);
    }

    try {
        const decoded = jwt.verify(token, env("ACCESS_TOKEN_KEY")) as unknown as JWTPayload;
        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new AppError("token expired", 403)
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new AppError("invalid token", 403)
        }

        throw err
    }
}