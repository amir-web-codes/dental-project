import type { Role } from "../generated/prisma";

export default interface JWTPayload {
    id: string;
    role: Role;
}