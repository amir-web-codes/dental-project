import type { Role, UserStatus } from "../../generated/prisma";

type CreateUserToken = {
    id: string,
    role: Role,
    status: UserStatus
}

type Tokens = {
    accessToken: string,
    refreshToken: string
}

export {
    CreateUserToken,
    Tokens
}