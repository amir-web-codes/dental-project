import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import jwt from "jsonwebtoken";
import env from "../utils/env";
import type { JWTPayload } from "../types/auth";

export default function optionalCheckToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];

    if (!token) {
        req.user = undefined;
        return next();
    }

    try {
        const decoded = jwt.verify(token, env("ACCESS_TOKEN_KEY")) as unknown as JWTPayload;
        req.user = decoded;
        next();
    } catch (err) {
        throw new AppError("invalid or expired token", 401);
    }
}