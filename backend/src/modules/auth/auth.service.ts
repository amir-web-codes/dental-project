import crypto from "crypto";
import AppError from "../../errors/AppError";
import { redisClient } from "../../configs/redis";
import { toProfileDto, findUserByIdOrThrow } from "../user/user.service";
import * as smsService from "./sms.service";
import prisma from "../../configs/prisma"
import jwt from "jsonwebtoken"
import env from "../../utils/env"
import bcrypt from "bcrypt"
import * as authDto from "./auth.dto"
import type { Prisma } from "../../generated/prisma"
import type { refreshTokenPayload } from "../../types/auth"

const OTP_EXPIRE_TIME = 120;
const OTP_SEND_LIMIT = 5;
const OTP_LIMIT_WINDOW = 60 * 10;
const MAX_CHECK_TRIES = 5;
const OTP_CHECK_WINDOW = 60 * 5;

const maximumTokens = 5
const maximumDeviceTokens = 2

function hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

async function sendOtp(phone: string): Promise<void> {
    const otpKey = `otp:${phone}`;
    const countKey = `otp:count:${phone}`;

    const currentCount = Number(await redisClient.get(countKey) ?? 0);

    if (currentCount >= OTP_SEND_LIMIT) {
        throw new AppError("too many OTP requests, try again later", 429);
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedOtp = hashOtp(otp);

    const result = await redisClient.set(
        otpKey,
        hashedOtp,
        {
            EX: OTP_EXPIRE_TIME,
            NX: true
        }
    );

    if (result === null) {
        throw new AppError(
            "please wait before requesting another OTP",
            429
        );
    }
    const attempts = await redisClient.incr(countKey);

    if (attempts === 1) {
        await redisClient.expire(
            countKey,
            OTP_LIMIT_WINDOW
        );
    }

    try {
        await smsService.sendSms(phone, otp);
    } catch {

        await redisClient.del(otpKey);
        throw new AppError("failed to send OTP, please try again later", 503);
    }
}

async function verifyOtp(data: { phone: string; otp: string; }): Promise<void> {

    const otpKey = `otp:${data.phone}`;
    const checkKey = `otp:check:${data.phone}`;
    const countKey = `otp:count:${data.phone}`;

    const savedOtp = await redisClient.get(otpKey);

    if (!savedOtp) {
        throw new AppError("OTP not found or expired", 400);
    }

    const checkAttempts = Number(
        await redisClient.get(checkKey) ?? 0
    );

    if (checkAttempts >= MAX_CHECK_TRIES) {
        throw new AppError("too many OTP attempts, please try again later", 429);
    }

    const attempts = await redisClient.incr(checkKey);

    if (attempts === 1) {
        await redisClient.expire(
            checkKey,
            OTP_CHECK_WINDOW
        );
    }

    const hashedOtp = hashOtp(data.otp);

    if (hashedOtp !== savedOtp) {
        throw new AppError("wrong OTP", 400);
    }

    await redisClient.del([
        otpKey,
        checkKey,
        countKey
    ]);
}

async function createUserAndToken(phone: string, userAgent: string, deviceId: string): Promise<authDto.UserAndTokens> {
    return await prisma.$transaction(async (tx) => {
        const dbUser = await tx.user.upsert({
            where: {
                phone
            },
            create: {
                phone
            },
            update: {
                lastLoginAt: new Date()
            }
        })

        const userToken = {
            id: dbUser.id,
            role: dbUser.role,
            status: dbUser.status
        }

        const { accessToken, refreshToken } = await createTokens(userToken, userAgent, deviceId, tx);
        const user = toProfileDto(dbUser)

        return { user, accessToken, refreshToken }
    })
}

async function createTokens(user: authDto.UserForToken, userAgent: string, deviceId: string, tx: Prisma.TransactionClient = prisma): Promise<authDto.Tokens> {
    const accessToken = jwt.sign({ id: user.id, role: user.role, status: user.status }, env("ACCESS_TOKEN_KEY"), { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: user.id, role: user.role, deviceId }, env("REFRESH_TOKEN_KEY"), { expiresIn: "15d" })

    const tokens = await tx.token.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    if (tokens.length >= maximumTokens) {
        const firstTokenId = tokens[0].id

        await tx.token.delete({
            where: {
                id: firstTokenId
            }
        })
    }

    const deviceTokens = await tx.token.findMany({
        where: { userId: user.id, deviceId },
        orderBy: {
            createdAt: "asc"
        }
    })


    if (deviceTokens.length >= maximumDeviceTokens) {
        const firstDeviceToken = deviceTokens[0].id

        await tx.token.delete({
            where: {
                id: firstDeviceToken
            }
        })
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15)

    await revokeUserToken(user.id, deviceId, tx)

    const hashedToken = await bcrypt.hash(refreshToken, 12)

    await tx.token.create({
        data: {
            hashedToken,
            userId: user.id,
            revoked: false,
            deviceId: String(deviceId),
            userAgent,
            expiresAt
        }
    })

    return { accessToken, refreshToken }
}

async function revokeUserToken(userId: string, deviceId?: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
    if (deviceId) {
        await tx.token.updateMany({
            where: {
                userId,
                deviceId
            },
            data: {
                revoked: true
            }
        })
    } else {
        await tx.token.updateMany({
            where: {
                userId
            },
            data: {
                revoked: true
            }
        })
    }
}

async function refreshAccessToken(token: string, userAgent: string, deviceId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            const decoded = jwt.verify(token, env("REFRESH_TOKEN_KEY")) as refreshTokenPayload

            if (decoded.deviceId !== deviceId) {
                await revokeUserToken(decoded.id, undefined, tx)
                throw new AppError("faked refresh token", 401)
            }

            const foundUser = await findUserByIdOrThrow(decoded.id, tx)

            const user = {
                id: foundUser.id,
                role: foundUser.role,
                status: foundUser.status
            }

            const foundTokens = await tx.token.findMany({
                where: {
                    userId: decoded.id,
                    deviceId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })

            if (!foundTokens.length || foundTokens[0].revoked) {
                await revokeUserToken(user.id, undefined, tx)
                throw new AppError("faked refresh token, please login again", 401)
            }

            const compareResult = await bcrypt.compare(token, foundTokens[0].hashedToken)

            console.log(foundTokens[0].hashedToken)
            console.log(token)

            if (!compareResult) {
                await revokeUserToken(user.id, undefined, tx)
                throw new AppError("faked refresh token", 401)
            }

            const updateResult = await tx.token.updateMany({
                where: {
                    id: foundTokens[0].id,
                    revoked: false
                },
                data: {
                    revoked: true
                }
            })

            if (updateResult.count === 1) {
                return await createTokens(user, userAgent, deviceId, tx)
            } else {
                throw new AppError("faked refresh token", 401)
            }
        })
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new AppError("token expired", 403)
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new AppError("invalid token", 403)
        }

        throw err
    }
}

export {
    sendOtp,
    verifyOtp,
    createUserAndToken,
    revokeUserToken,
    refreshAccessToken
}