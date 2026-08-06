import type { Role, UserStatus } from "../../generated/prisma"
import { Prisma } from "../../generated/prisma/client"

type UserDto = Prisma.UserGetPayload<{}>

type UserProfileDto = Prisma.UserGetPayload<{
    select: {
        id: true
        phone: true
        name: true
        family: true
        role: true
        status: true
        birthDate: true
        profileCompleted: true
    }
}>

interface UserUpdateDto {
    name?: string,
    family?: string
}

interface UserCreateDto {
    otp: string,
    phone: string,
    name: string,
    family: string
}

export {
    UserDto,
    UserProfileDto,
    UserUpdateDto,
    UserCreateDto
}