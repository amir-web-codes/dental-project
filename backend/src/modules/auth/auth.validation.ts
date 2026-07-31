// import { z } from "zod"

// export const sendOtpSchema = z.object({
//     phone: z
//         .string()
//         .trim()
//         .transform(normalizePhone)
//         .refine(
//             (phone) => /^09\d{9}$/.test(phone),
//             "شماره موبایل معتبر نیست"
//         ),
// });