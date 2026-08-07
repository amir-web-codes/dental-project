import prisma from "../../configs/prisma";
import AppError from "../../errors/AppError";
import type { Prisma, User } from "../../generated/prisma";
import { invalidateUserStateCache } from "../../utils/cache/userState.cache";
import type * as userDto from "./user.dto";

async function findUserByIdOrThrow(id: string, options: { includeDeleted?: boolean } = {}): Promise<User> {
    const query: Prisma.UserWhereInput = { id };

    if (!options.includeDeleted) {
        query.status = { not: "DELETED" };
    }

    const user = await prisma.user.findFirst({ where: query });

    if (!user) {
        throw new AppError("user not found", 404);
    }

    return user;
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

function toAdminDetailDto(user: User): userDto.AdminUserDetailDto {
    return {
        ...toProfileDto(user),
        deletedAt: user.deletedAt,
        bannedAt: user.bannedAt,
        banExpiresAt: user.banExpiresAt,
        banReason: user.banReason,
        unbannedAt: user.unbannedAt,
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

async function getUserDetailForAdmin(id: string): Promise<userDto.AdminUserDetailDto> {
    const user = await findUserByIdOrThrow(id, { includeDeleted: true });
    return toAdminDetailDto(user);
}

export {
    findUserByIdOrThrow,
    toProfileDto,
    toAdminDetailDto,
    getUserProfile,
    updateUserProfile,
    getUserDetailForAdmin
};