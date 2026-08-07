import AppError from "../errors/AppError"
import { z } from "zod"
import type { Request } from "express"

const idSchema = z.object({
    id: z.string().cuid()
})

export default function validateId(req: Request) {

    return idSchema.parse(req.params.id)
}