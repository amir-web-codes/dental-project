/*
  Warnings:

  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "DentalSpecialty" AS ENUM ('GENERAL', 'ORTHODONTICS', 'ENDODONTICS', 'PERIODONTICS', 'PROSTHODONTICS', 'ORAL_SURGERY');

-- CreateEnum
CREATE TYPE "DentistVerificationStatus" AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DentistStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullName",
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "family" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unbannedAt" TIMESTAMP(3),
ADD COLUMN     "unbannedById" TEXT;

-- CreateTable
CREATE TABLE "dentists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "bio" TEXT,
    "specialty" "DentalSpecialty",
    "yearsOfExperience" INTEGER,
    "clinicName" TEXT,
    "clinicAddress" TEXT,
    "verificationStatus" "DentistVerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "status" "DentistStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dentists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedRole" "Role" NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dentists_userId_key" ON "dentists"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dentists_licenseNumber_key" ON "dentists"("licenseNumber");

-- CreateIndex
CREATE INDEX "dentists_userId_idx" ON "dentists"("userId");

-- CreateIndex
CREATE INDEX "dentists_licenseNumber_idx" ON "dentists"("licenseNumber");

-- CreateIndex
CREATE INDEX "dentists_specialty_idx" ON "dentists"("specialty");

-- CreateIndex
CREATE INDEX "dentists_status_verificationStatus_idx" ON "dentists"("status", "verificationStatus");

-- CreateIndex
CREATE INDEX "requests_userId_idx" ON "requests"("userId");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_unbannedById_fkey" FOREIGN KEY ("unbannedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentists" ADD CONSTRAINT "dentists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
