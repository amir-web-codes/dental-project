import type { Role, UserStatus, Gender } from "../../generated/prisma";

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
    bannedAt: Date | null;
    banExpiresAt: Date | null;
    banReason: string | null;
    unbannedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export {
    UserProfileDto,
    UserUpdateProfileDto,
    AdminUserDetailDto
};