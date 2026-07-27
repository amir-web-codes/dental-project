import { randomUUID } from "crypto"
import type { Request, Response, NextFunction } from "express"

export default function (req: Request, res: Response, next: NextFunction) {

    // req.requestId = randomUUID()

    next()
}