import type { Role, UserStatus, Gender } from "../../generated/prisma";
import type { Prisma } from "../../generated/prisma"

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
    createdAt: Date;
    updatedAt: Date;
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

export {
    UserProfileDto,
    UserUpdateProfileDto,
    AdminUserDetailDto,
    UserInclude,
    AdminUser
};