import JWTPayload from "./auth"

declare global {
    namespace Express {
        interface Request {
            requestId: string,
            user?: JWTPayload
        }
    }
}

export { }