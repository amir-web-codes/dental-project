import PaginationDto from "../../types/pagination";
import type { Prisma, Role, UserStatus, Gender, RequestStatus, Request } from "../../generated/prisma";
import type { DentistPublicDto } from "../dentist/dentist.dto"

interface IncludedUser {
    id: string,
    phone: string,
    name: string | null,
    family: string | null
}

interface UserProfileDto {
    id: string;
    phone: string;
    name: string | null;
    family: string | null;
    birthDate: Date | null;
    gender: Gender | null;
    role: Role;
    status: UserStatus;
    bannedAt: Date | null;
    banExpiresAt: Date | null;
    banReason: string | null;
    profileCompleted: boolean;
}

interface UserUpdateProfileDto {
    name?: string;
    family?: string;
    birthDate?: string;
    gender?: Gender;
}

interface AdminUserDetailDto extends UserProfileDto {
    deletedAt: Date | null;
    deletedBy: IncludedUser | null,
    bannedAt: Date | null;
    bannedBy: IncludedUser | null,
    banExpiresAt: Date | null;
    banReason: string | null;
    unbannedAt: Date | null;
    unbannedBy: IncludedUser | null,
    lastLoginAt: Date,
    createdAt: Date;
    updatedAt: Date;
}

interface AdminUserDetailWithProfiles {
    userProfile: UserProfileDto | AdminUserDetailDto;
    dentistProfile?: DentistPublicDto;
}

const UserSelect = {
    id: true,
    phone: true,
    name: true,
    family: true
} satisfies Prisma.UserSelect;

const UserInclude = {
    deletedBy: {
        select: UserSelect
    },
    bannedBy: {
        select: UserSelect
    },
    unbannedBy: {
        select: UserSelect
    }
} satisfies Prisma.UserInclude;

type AdminUser = Prisma.UserGetPayload<{
    include: typeof UserInclude
}>;

interface RequestCreateDto {
    requestedRole: "DENTIST" | "ADMIN";
    reason?: string;
}

interface RequestReviewDto {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string;
}

interface RequestListQueryDto extends PaginationDto {
    status?: RequestStatus;
    requestedRole?: Role;
    userId?: string;
}

interface AdminChangeRoleDto {
    role: Role;
}

interface AdminBanUserDto {
    banDays?: number;
    banReason?: string;
}

type RequestDto = Request

export {
    UserProfileDto,
    UserUpdateProfileDto,
    AdminUserDetailDto,
    UserInclude,
    AdminUser,
    RequestCreateDto,
    RequestReviewDto,
    RequestListQueryDto,
    AdminChangeRoleDto,
    AdminBanUserDto,
    AdminUserDetailWithProfiles,
    RequestDto
};