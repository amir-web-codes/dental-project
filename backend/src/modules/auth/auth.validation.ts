import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

function normalizePhone(phone: string) {
    let value = phone.trim();

    value = value.replace(/[\s\-()]/g, "");

    if (value.startsWith("0098")) {
        value = "+98" + value.slice(4);
    }

    if (value.startsWith("98")) {
        value = "+" + value;
    }

    if (value.startsWith("09")) {
        value = "+98" + value.slice(1);
    }

    return value;
}

const sendOtpSchema = z.object({
    phone: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .transform(normalizePhone)
        .refine(
            phone => isValidPhoneNumber(phone, "IR"),
            {
                message: "Invalid phone number"
            }
        )
});

const verifyOtpSchema = z.object({
    phone: z.string().trim().min(1, "Phone number is required"),
    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits")
})

export {
    sendOtpSchema,
    verifyOtpSchema
}