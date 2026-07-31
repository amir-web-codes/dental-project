interface JWTPayload {
    id: string,
    role: "user" | "dentist" | "doctor"
}