import type { Request, Response, NextFunction } from "express"
import env from "../utils/env"
import jwt from "jsonwebtoken"
import AppError from "../errors/AppError"


export default function checkToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    const token = header && header.split(" ")[1]

    if (!token) {
        throw new AppError("token not provided", 401)
    }

    try {

        const decoded = jwt.verify(token, env("ACCESS_TOKEN_KEY"))
        req.user = decoded

        next()

    } catch (err) {
        throw new AppError("invalid or expired token", 403)
    }
}