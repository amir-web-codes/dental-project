-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
