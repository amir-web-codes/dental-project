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
        .transform(normalizePhone)
        .refine(
            (phone) => /^\+989\d{9}$/.test(phone),
            {
                message: "Invalid phone number"
            }
        )
});

export {
    sendOtpSchema
}