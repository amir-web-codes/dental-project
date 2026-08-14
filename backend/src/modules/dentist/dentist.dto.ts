import type { DentalSpecialty, DentistVerificationStatus, DentistStatus } from "../../generated/prisma";

interface DentistUserSummary {
    id: string;
    name: string | null;
    family: string | null;
}

interface DentistPublicDto {
    id: string;
    user: DentistUserSummary;
    bio: string | null;
    specialty: DentalSpecialty | null;
    yearsOfExperience: number | null;
    clinicName: string | null;
    clinicAddress: string | null;
    verificationStatus: DentistVerificationStatus;
    status: DentistStatus;
}

interface DentistSelfDto extends DentistPublicDto {
    licenseNumber: string | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface DentistUpdateSelfDto {
    licenseNumber?: string;
    bio?: string;
    specialty?: DentalSpecialty;
    yearsOfExperience?: number;
    clinicName?: string;
    clinicAddress?: string;
    status?: "ACTIVE" | "INACTIVE";
}

interface DentistListQueryDto {
    page: number;
    limit: number;
    search?: string;
    specialty?: DentalSpecialty;
    minYearsOfExperience?: number;
    status?: DentistStatus;
    verificationStatus?: DentistVerificationStatus;
}

export {
    DentistUserSummary,
    DentistPublicDto,
    DentistSelfDto,
    DentistUpdateSelfDto,
    DentistListQueryDto
};