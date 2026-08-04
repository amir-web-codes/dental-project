import crypto from "crypto"
import bcrypt from "bcrypt"
import prisma from "../../configs/prisma"
import AppError from "../../errors/AppError"
import { redisClient } from "../../configs/redis"

const MAX_SEND_TRIES = 5
const MAX_CHECK_TRIES = 10

function hashOtp(otp: string): string {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}

async function sendOtp(phone: string) {

    const otp = crypto.randomInt(100000, 1000000)
        .toString()

    const hashedOtp = hashOtp(otp)

    const otpKey = `otp:${phone}`

    const exists = await redisClient.exists(otpKey)

    if (exists) {
        throw new AppError(
            "wait before requesting again",
            429
        )
    }

    await redisClient.set(
        otpKey,
        hashedOtp,
        {
            EX: 120
        }
    )

    const countKey = `otp:count:${phone}`

    const count = await redisClient.incr(countKey)

    if (count === 1) {
        await redisClient.expire(
            countKey,
            1800
        )
    }


    console.log(otp)
}

async function verifyOtp(data: { phone: string, otp: string }) {
    const key = `otp:${data.phone}`
    const checkKey = `otp:check:${data.phone}`
    const savedOtp = await redisClient.get(key)
    let checkCooldown = Number(await redisClient.get(checkKey))

    if (!checkCooldown) {
        checkCooldown = 0
        await redisClient.set(checkKey, 0, { EX: 300 })
    }

    if (checkCooldown > MAX_CHECK_TRIES) {
        throw new AppError("too many OTP requests, please try again later", 429)
    }
    console.log(checkCooldown)
    await redisClient.incr(checkKey)

    if (!savedOtp) {
        throw new AppError("no OTP sent for this number", 400)
    } else {

    }
    const compareResult = await bcrypt.compare(data.otp, savedOtp)

    if (!compareResult) {
        throw new AppError("wrong OTP", 400)
    }

    console.log("logined")
}

export {
    sendOtp,
    verifyOtp
}