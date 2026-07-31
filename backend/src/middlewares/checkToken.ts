import type { Request, Response, NextFunction } from "express"
import env from "../configs/env"
import jwt from "jsonwebtoken"


export default function checkToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    const token = header && header.split(" ")[1]

    if (!token) {
        const err = new Error("token not provided")
        err.status = 401
        throw err
    }

    try {

        const decoded = jwt.verify(token, env("ACCESS_TOKEN_KEY"))
        req.user = decoded

        next()

    } catch (err) {
        err = new Error("invalid or expired token")
        err.status = 403
        throw err
    }
}