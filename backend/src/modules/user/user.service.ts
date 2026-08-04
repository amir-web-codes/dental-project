import prisma from "../../configs/prisma"
import AppError from "../../errors/AppError"
import type { Prisma } from "../../generated/prisma"
import type * as userDto from "./user.dto"

async function getUserById(id: string, getDeleted: boolean = false, isAdmin: boolean = false): Promise<userDto.UserProfileDto> {
    const query: Prisma.UserWhereInput = {
        id,
        status: {
            not: "DELETED"
        }
    }

    if (getDeleted) {
        if (isAdmin) {
            query.status = {}
        } else {
            throw new AppError("you don't have access to deleted users", 403)
        }
    }

    const data = await prisma.user.findFirst({
        where: query
    })

    if (!data) {
        throw new AppError("user not found", 404)
    }

    return data
}

async function updateUserById(body: userDto.UserUpdateDto, id: string): Promise<userDto.UserProfileDto> {
    const query: Prisma.UserUpdateInput = {};

    if (body.fullName !== undefined) query.fullName = body.fullName

    const data = await prisma.user.update({
        where: {
            id
        },
        data: query
    })

    return data
}

export {
    getUserById,
    updateUserById
}