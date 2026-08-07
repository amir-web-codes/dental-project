import type { Request } from "express"
import type { Role } from "../generated/prisma";

export interface JWTPayload {
    id: string;
    role: Role;
}