import type { Role, UserStatus, User } from "../../generated/prisma";
import type { UserProfileDto } from "../user/user.dto";

type UserForToken = {
    id: string,
    role: Role,
    status: UserStatus
}

type Tokens = {
    accessToken: string,
    refreshToken: string
}

type UserAndTokens = Tokens & {
    user: UserProfileDto
}

export {
    UserForToken,
    Tokens,
    UserAndTokens
}