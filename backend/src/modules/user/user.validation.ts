import { z } from "zod";

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

export {
    updateProfileSchema,
    includeDeletedSchema
};