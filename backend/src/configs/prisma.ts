import env from "../utils/env"
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient();

if (env("NODE_ENV") !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;