import { string } from "zod"
import type { Role, UserStatus } from "../../generated/prisma"

interface UserProfileDto {
    id: string,
    phone: string,
    fullName: string,
    role: Role,
    status: UserStatus
}

interface UserUpdateDto {
    fullName?: string,
}

interface UserCreateDto {
    otp: string,
    phone: string,
    fullName: string
}

export {
    UserProfileDto,
    UserUpdateDto,
    UserCreateDto
}