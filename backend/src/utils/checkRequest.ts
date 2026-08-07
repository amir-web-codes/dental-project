import AppError from "../errors/AppError";
import type { JWTPayload } from "../types/auth";
import type { Request } from "express";

export default function checkRequest(req: Request): JWTPayload {
    if (!req.user) {
        throw new AppError("no token provided", 401)
    }

    return req.user
}