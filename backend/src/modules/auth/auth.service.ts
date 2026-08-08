import type { User } from "@/generated/prisma"
import crypto from "crypto"
import prisma from "../../configs/prisma"
import AppError from "../../errors/AppError"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import env from "../../utils/env"
import { redisClient } from "../../configs/redis"
import * as smsService from "./sms.service"

const OTP_EXPIRE_TIME = 120;
const OTP_SEND_LIMIT = 5;
const MAX_CHECK_TRIES = 10
const OTP_LIMIT_WINDOW = 60 * 10; // 15 minutes


function hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
}


async function sendOtp(phone: string) {
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
        await redisClient.expire(countKey, OTP_LIMIT_WINDOW);
    }

    await smsService.sendSms(phone, otp)
}

async function verifyOtpAndLogin(data: { phone: string, otp: string }) {
    const otpKey = `otp:${data.phone}`
    const checkKey = `otp:check:${data.phone}`
    const savedOtp = await redisClient.get(otpKey)
    const checkAttempts = Number(await redisClient.get(checkKey) ?? 0)

    if (checkAttempts >= MAX_CHECK_TRIES) {
        throw new AppError("too many OTP requests, please try again later", 429)
    }

    if (!savedOtp) {
        throw new AppError("no OTP sent for this number or Expired", 400)
    }

    const hashedOtp = hashOtp(data.otp)
    const attempts = await redisClient.incr(checkKey)
    if (attempts === 1) {
        await redisClient.expire(checkKey, 300);
    }

    if (hashedOtp !== savedOtp) {
        throw new AppError("wrong OTP", 400)
    }

    // const createdUser = await prisma.user.create({
    //     data: {
    //         phone: data.phone,
    //         fullName: data.fullName
    //     }
    // })

    await redisClient.del(otpKey)
    await redisClient.del(checkKey)

    // await createTokens(createdUser)
}

async function createTokens(user: User, rememberMe: boolean = false, deviceId: string, userAgent: string) {
    const accessToken = jwt.sign({ id: user.id, role: user.role, status: user.status }, env("ACCESS_TOKEN_KEY"), { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: user.id, role: user.role, deviceId }, env("REFRESH_TOKEN_KEY"), { expiresIn: rememberMe ? "15d" : "1d" })

    const tokens = await prisma.token.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    const firstTokenId = tokens[0].id

    const maximumTokens = 5

    if (tokens.length >= maximumTokens) {
        await prisma.token.delete({
            where: {
                id: firstTokenId
            }
        })
    }

    const deviceTokens = await prisma.token.findMany({
        where: { userId: user.id, deviceId }
    })

    const maximumDeviceTokens = 2
    const firstDeviceToken = deviceTokens[0].id

    if (deviceTokens.length >= maximumDeviceTokens) {
        await prisma.token.delete({
            where: {
                id: firstDeviceToken
            }
        })
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * (rememberMe ? 15 : 1))

    // await revokeUserToken(user.id, deviceId)

    const hashedToken = await bcrypt.hash(refreshToken, 12)

    await prisma.token.create({
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

export {
    sendOtp,
    verifyOtpAndLogin
}