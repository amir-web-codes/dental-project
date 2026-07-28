import JWTPayload from "./user"

declare global {
    namespace Express {
        interface Request {
            requestId: string,
            user?: JWTPayload
        }
    }
}

export { }