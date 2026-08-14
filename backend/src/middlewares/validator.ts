import AppError from "../errors/AppError";
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";


export default function validator(schema: ZodType, source: "body" | "params" | "query" = "body") {

    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req[source]);


        if (!result.success) {
            throw new AppError("invalid inputs", 400, result.error.issues)
        }

        if (source !== "query") {
            req[source] = result.data;
        }

        next();
    };
}