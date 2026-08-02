import type { Role, UserStatus } from "../../generated/prisma"

interface UserProfileDto {
    id: string,
    phone: string,
    fullName: string,
    role: Role,
    status: UserStatus
}

export {
    UserProfileDto
}