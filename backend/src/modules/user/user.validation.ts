import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";

const genderEnum = z.enum(["MALE", "FEMALE"]);

const updateProfileSchema = z.object({
    name: z.string().trim().min(2).max(50).optional(),
    family: z.string().trim().min(2).max(50).optional(),
    birthDate: z.coerce.date().max(new Date(), { message: "birthDate cannot be in the future" }).optional(),
    gender: genderEnum.optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided"
});

const includeDeletedSchema = z.object({
    includeDeleted: z
        .enum(["true", "false"])
        .transform(value => value === "true")
        .optional()
});

const createRequestSchema = z.object({
    requestedRole: z.enum(["DENTIST", "ADMIN"]),
    reason: z.string().trim().min(3).max(500).optional()
});

const reviewRequestSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().trim().min(3).max(500).optional()
}).refine((data) => (data.status === "REJECTED" ? Boolean(data.rejectionReason) : true), {
    message: "rejectionReason is required when rejecting a request",
    path: ["rejectionReason"]
});

const listRequestsSchema = paginationSchema.extend({
    status: z.enum(["OPEN", "APPROVED", "REJECTED"]).optional(),
    requestedRole: z.enum(["USER", "DENTIST", "ADMIN"]).optional(),
    userId: z.string().cuid().optional()
});

const requestIdParamSchema = z.object({
    id: z.string().cuid()
});

export {
    updateProfileSchema,
    includeDeletedSchema,
    createRequestSchema,
    reviewRequestSchema,
    listRequestsSchema,
    requestIdParamSchema
};