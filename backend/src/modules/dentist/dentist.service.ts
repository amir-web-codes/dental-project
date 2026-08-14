import prisma from "../../configs/prisma";
import AppError from "../../errors/AppError";
import type { Prisma, Dentist } from "../../generated/prisma";
import { getPaginationParams, buildMeta } from "../../utils/pagination";
import type * as dentistDto from "./dentist.dto";

type DentistWithUser = Dentist & { user: dentistDto.DentistUserSummary };

function toPublicDto(dentist: DentistWithUser): dentistDto.DentistPublicDto {
    return {
        id: dentist.id,
        user: dentist.user,
        bio: dentist.bio,
        specialty: dentist.specialty,
        yearsOfExperience: dentist.yearsOfExperience,
        clinicName: dentist.clinicName,
        clinicAddress: dentist.clinicAddress,
        verificationStatus: dentist.verificationStatus,
        status: dentist.status
    };
}

function toSelfDto(dentist: DentistWithUser): dentistDto.DentistSelfDto {
    return {
        ...toPublicDto(dentist),
        licenseNumber: dentist.licenseNumber,
        rejectionReason: dentist.rejectionReason,
        createdAt: dentist.createdAt,
        updatedAt: dentist.updatedAt
    };
}

const userSummarySelect = {
    id: true,
    name: true,
    family: true
} as const;

async function findDentistByIdOrThrow(id: string): Promise<DentistWithUser> {
    const dentist = await prisma.dentist.findUnique({
        where: { id },
        include: { user: { select: userSummarySelect } }
    });

    if (!dentist) {
        throw new AppError("dentist not found", 404);
    }

    return dentist;
}

async function findDentistByUserIdOrThrow(userId: string): Promise<DentistWithUser> {
    const dentist = await prisma.dentist.findUnique({
        where: { userId },
        include: { user: { select: userSummarySelect } }
    });

    if (!dentist) {
        throw new AppError("dentist profile not found", 404);
    }

    return dentist;
}

async function listDentists(query: dentistDto.DentistListQueryDto, isAdmin: boolean) {
    if (!isAdmin && (query.status || query.verificationStatus)) {
        throw new AppError("you don't have access to this filter", 403);
    }

    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.DentistWhereInput = {};

    if (isAdmin) {
        if (query.status) where.status = query.status;
        if (query.verificationStatus) where.verificationStatus = query.verificationStatus;
    } else {
        where.status = "ACTIVE";
        where.verificationStatus = "VERIFIED";
    }

    if (query.specialty) where.specialty = query.specialty;
    if (query.minYearsOfExperience !== undefined) {
        where.yearsOfExperience = { gte: query.minYearsOfExperience };
    }
    if (query.search) {
        where.clinicName = { contains: query.search, mode: "insensitive" };
    }

    const [items, totalItems] = await prisma.$transaction([
        prisma.dentist.findMany({
            where,
            include: { user: { select: userSummarySelect } },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.dentist.count({ where })
    ]);

    return {
        data: items.map(toPublicDto),
        meta: buildMeta(page, limit, totalItems)
    };
}

async function getMyDentistProfile(userId: string) {
    const dentist = await findDentistByUserIdOrThrow(userId);
    return toSelfDto(dentist);
}

async function updateMyDentistProfile(userId: string, body: dentistDto.DentistUpdateSelfDto) {
    const dentist = await findDentistByUserIdOrThrow(userId);

    if (dentist.verificationStatus === "PENDING") {
        throw new AppError("you cannot edit your profile while verification is pending", 409);
    }

    if (dentist.status === "SUSPENDED") {
        throw new AppError("your dentist profile is suspended", 403);
    }

    const data: Prisma.DentistUpdateInput = {};

    if (body.licenseNumber !== undefined) data.licenseNumber = body.licenseNumber;
    if (body.bio !== undefined) data.bio = body.bio;
    if (body.specialty !== undefined) data.specialty = body.specialty;
    if (body.yearsOfExperience !== undefined) data.yearsOfExperience = body.yearsOfExperience;
    if (body.clinicName !== undefined) data.clinicName = body.clinicName;
    if (body.clinicAddress !== undefined) data.clinicAddress = body.clinicAddress;
    if (body.status !== undefined) data.status = body.status;

    let updated: DentistWithUser;
    try {
        updated = await prisma.dentist.update({
            where: { userId },
            data,
            include: { user: { select: userSummarySelect } }
        });
    } catch (err) {
        if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
            throw new AppError("license number already in use", 409);
        }
        throw err;
    }

    return toSelfDto(updated);
}

async function requestVerification(userId: string) {
    const dentist = await findDentistByUserIdOrThrow(userId);

    if (dentist.verificationStatus === "PENDING") {
        throw new AppError("verification is already pending", 409);
    }
    if (dentist.verificationStatus === "VERIFIED") {
        throw new AppError("your profile is already verified", 409);
    }
    if (!dentist.licenseNumber || !dentist.specialty) {
        throw new AppError(
            "please complete your professional profile (license number and specialty) before requesting verification",
            400
        );
    }

    const result = await prisma.dentist.updateMany({
        where: { userId, verificationStatus: { in: ["DRAFT", "REJECTED"] } },
        data: { verificationStatus: "PENDING", rejectionReason: null }
    });

    if (result.count === 0) {
        throw new AppError("verification is already pending", 409);
    }

    const updated = await findDentistByUserIdOrThrow(userId);
    return toSelfDto(updated);
}

async function ensureDentistProfile(userId: string, tx: Prisma.TransactionClient = prisma) {
    await tx.dentist.upsert({
        where: { userId },
        create: { userId },
        update: { status: "ACTIVE" }
    });
}

async function suspendDentistProfileIfExists(userId: string, tx: Prisma.TransactionClient = prisma) {
    await tx.dentist.updateMany({
        where: { userId, status: { not: "SUSPENDED" } },
        data: { status: "SUSPENDED" }
    });
}

async function restoreDentistProfileIfSuspended(userId: string, tx: Prisma.TransactionClient = prisma) {
    await tx.dentist.updateMany({
        where: { userId, status: "SUSPENDED" },
        data: { status: "ACTIVE" }
    });
}

export {
    findDentistByIdOrThrow,
    findDentistByUserIdOrThrow,
    listDentists,
    getMyDentistProfile,
    updateMyDentistProfile,
    requestVerification,
    ensureDentistProfile,
    suspendDentistProfileIfExists,
    restoreDentistProfileIfSuspended,
    toPublicDto,
    toSelfDto
};