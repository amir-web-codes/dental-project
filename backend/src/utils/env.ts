type EnvType =
    "PORT" |
    "NODE_ENV" |
    "ACCESS_TOKEN_KEY" |
    "REFRESH_TOKEN_KEY" |
    "POSTGRES_USER" |
    "POSTGRES_PASSWORD" |
    "POSTGRES_DB" |
    "DATABASE_URL" |
    "REDIS_URL"

export default function getEnv(env: EnvType): string {
    const value = process.env[env];

    if (!value) {
        throw new Error(`${env} is not defined`);
    }

    return value
}