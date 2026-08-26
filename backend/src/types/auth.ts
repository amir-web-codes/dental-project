import type { Role, UserStatus } from "../generated/prisma";

export interface JWTPayload {
    id: string;
    role: Role;
    status: UserStatus;
}

export interface refreshTokenPayload {
    id: string;
    role: Role;
    deviceId: string;
}