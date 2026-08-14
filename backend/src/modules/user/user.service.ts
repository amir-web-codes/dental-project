import prisma from "../../configs/prisma";
import AppError from "../../errors/AppError";
import { Prisma, User } from "../../generated/prisma";
import { invalidateUserStateCache } from "../../utils/cache/userState.cache";
import * as userDto from "./user.dto";
import logger from "../../configs/logger";
import { getPaginationParams, buildMeta } from "../../utils/pagination";
import { ensureDentistProfile } from "../dentist/dentist.service";

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

async function createRequest(userId: string, body: userDto.RequestCreateDto) {
    const user = await findUserByIdOrThrow(userId);

    if (user.role === body.requestedRole) {
        throw new AppError("you already have this role", 409);
    }

    const existingOpen = await prisma.request.findFirst({
        where: { userId, status: "OPEN" }
    });

    if (existingOpen) {
        throw new AppError("you already have an open request, please wait for it to be reviewed", 409);
    }

    try {
        return await prisma.request.create({
            data: {
                userId,
                requestedRole: body.requestedRole,
                reason: body.reason
            }
        });
    } catch (err) {

        if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2010") {
            throw new AppError("you already have an open request, please wait for it to be reviewed", 409);
        }
        throw err;
    }
}

async function listRequests(query: userDto.RequestListQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.RequestWhereInput = {};
    const hasFilters = Boolean(query.status || query.requestedRole || query.userId);

    if (!hasFilters) {
        where.status = "OPEN";
    } else {
        if (query.status) where.status = query.status;
        if (query.requestedRole) where.requestedRole = query.requestedRole;
        if (query.userId) where.userId = query.userId;
    }

    const [items, totalItems] = await prisma.$transaction([
        prisma.request.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.request.count({ where })
    ]);

    return {
        data: items,
        meta: buildMeta(page, limit, totalItems)
    };
}

async function findRequestByIdOrThrow(id: string) {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) {
        throw new AppError("request not found", 404);
    }
    return request;
}

export {
    findUserByIdOrThrow,
    toProfileDto,
    toAdminDetailDto,
    getUserProfile,
    updateUserProfile,
    getUserDetailForAdmin,
    deleteUserById,
    createRequest,
    listRequests,
    findRequestByIdOrThrow,
    reviewRequest
};

async function reviewRequest(requestId: string, adminId: string, body: userDto.RequestReviewDto) {
    const request = await findRequestByIdOrThrow(requestId);

    if (request.status !== "OPEN") {
        throw new AppError("this request has already been reviewed", 409);
    }

    await findUserByIdOrThrow(request.userId);

    const updated = await prisma.$transaction(async (tx) => {
        const updateResult = await tx.request.updateMany({
            where: { id: requestId, status: "OPEN" },
            data: {
                status: body.status,
                reviewedById: adminId,
                reviewedAt: new Date(),
                rejectionReason: body.status === "REJECTED" ? body.rejectionReason : null
            }
        });

        if (updateResult.count === 0) {
            throw new AppError("this request has already been reviewed", 409);
        }

        if (body.status === "APPROVED") {
            await tx.user.update({
                where: { id: request.userId },
                data: { role: request.requestedRole }
            });

            if (request.requestedRole === "DENTIST") {
                await ensureDentistProfile(request.userId, tx);
            }
        }

        return tx.request.findUniqueOrThrow({ where: { id: requestId } });
    });

    await invalidateUserStateCache(request.userId);

    logger.info({
        message: "role request reviewed",
        requestId,
        adminId,
        targetUserId: request.userId,
        decision: body.status
    });

    return updated;
}