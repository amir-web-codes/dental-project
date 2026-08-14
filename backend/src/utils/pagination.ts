import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function getPaginationParams(query: { page: number; limit: number }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

export function buildMeta(page: number, limit: number, totalItems: number) {
    return {
        page,
        limit,
        totalItems,
        totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit)
    };
}