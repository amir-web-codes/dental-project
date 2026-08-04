import { isValidPhoneNumber } from "libphonenumber-js";
import AppError from "../errors/AppError";

export default function validatePhoneNumber(phone: string) {
    const valid = isValidPhoneNumber(
        phone,
        "IR"
    );

    if (!valid) {
        throw new AppError(
            "Invalid phone number",
            400
        );
    }
}