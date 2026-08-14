import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";

const specialtyEnum = z.enum([
    "GENERAL",
    "ORTHODONTICS",
    "ENDODONTICS",
    "PERIODONTICS",
    "PROSTHODONTICS",
    "ORAL_SURGERY"
]);

const dentistStatusEnum = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);
const verificationStatusEnum = z.enum(["DRAFT", "PENDING", "VERIFIED", "REJECTED"]);

const listDentistsSchema = paginationSchema.extend({
    search: z.string().trim().min(1).max(100).optional(),
    specialty: specialtyEnum.optional(),
    minYearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
    status: dentistStatusEnum.optional(),
    verificationStatus: verificationStatusEnum.optional()
});

const updateSelfDentistSchema = z.object({
    licenseNumber: z.string().trim().min(3).max(50).optional(),
    bio: z.string().trim().max(1000).optional(),
    specialty: specialtyEnum.optional(),
    yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
    clinicName: z.string().trim().min(2).max(150).optional(),
    clinicAddress: z.string().trim().min(5).max(300).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided"
});

export {
    listDentistsSchema,
    updateSelfDentistSchema
};