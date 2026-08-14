import prisma from "../../configs/prisma";
import AppError from "../../errors/AppError";
import { Prisma, User } from "../../generated/prisma";
import { invalidateUserStateCache } from "../../utils/cache/userState.cache";
import * as userDto from "./user.dto";

async function findUserByIdOrThrow(id: string): Promise<User> {

    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!user) {
        throw new AppError("user not found", 404);
    }

    return user;
}

async function getUserDetailForAdmin(id: string, options: { includeDeleted?: boolean } = {}): Promise<userDto.AdminUserDetailDto> {
    const query: Prisma.UserWhereInput = { id }
    const include = userDto.UserInclude

    if (!options.includeDeleted) {
        query.status = { not: "DELETED" };
    }

    const user = await prisma.user.findFirst({
        where: query,
        include
    })

    if (!user) {
        throw new AppError("user not found", 404);
    }

    return toAdminDetailDto(user);
}

function toProfileDto(user: User): userDto.UserProfileDto {
    return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        family: user.family,
        birthDate: user.birthDate,
        gender: user.gender,
        role: user.role,
        status: user.status,
        profileCompleted: user.profileCompleted
    };
}

function toAdminDetailDto(user: userDto.AdminUser): userDto.AdminUserDetailDto {
    return {
        ...toProfileDto(user),
        deletedAt: user.deletedAt,
        deletedBy: user.deletedBy,
        bannedAt: user.bannedAt,
        bannedBy: user.bannedBy,
        banExpiresAt: user.banExpiresAt,
        banReason: user.banReason,
        unbannedAt: user.unbannedAt,
        unbannedBy: user.unbannedBy,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

async function getUserProfile(id: string): Promise<userDto.UserProfileDto> {
    const user = await findUserByIdOrThrow(id);
    return toProfileDto(user);
}

async function updateUserProfile(id: string, body: userDto.UserUpdateProfileDto): Promise<userDto.UserProfileDto> {
    const existing = await findUserByIdOrThrow(id);

    const data: Prisma.UserUpdateInput = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.family !== undefined) data.family = body.family;
    if (body.birthDate !== undefined) data.birthDate = new Date(body.birthDate);
    if (body.gender !== undefined) data.gender = body.gender;

    const merged = {
        name: body.name ?? existing.name,
        family: body.family ?? existing.family,
        birthDate: body.birthDate ? new Date(body.birthDate) : existing.birthDate,
        gender: body.gender ?? existing.gender
    };

    data.profileCompleted = Boolean(merged.name && merged.family && merged.birthDate && merged.gender);

    const updated = await prisma.user.update({ where: { id }, data });

    await invalidateUserStateCache(id);

    return toProfileDto(updated);
}

async function deleteUserById(id: string, userId: string) {
    try {
        return await prisma.user.update({
            where: {
                id,
                role: { not: "ADMIN" }
            },
            data: {
                status: "DELETED",
                deletedAt: new Date(),
                deletedById: userId
            }
        })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new AppError("user not found or was an admin", 404)
        }

        throw err
    }
}

export {
    findUserByIdOrThrow,
    toProfileDto,
    toAdminDetailDto,
    getUserProfile,
    updateUserProfile,
    getUserDetailForAdmin,
    deleteUserById
};