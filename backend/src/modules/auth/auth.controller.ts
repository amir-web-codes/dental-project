import type { Request, Response } from "express"
import AppError from "../../errors/AppError"
import * as userService from "./auth.service"
import { randomUUID } from "crypto"
import checkRequest from "../../utils/checkRequest"

async function sendOtp(req: Request, res: Response): Promise<void> {
    await userService.sendOtp(req.body.phone)

    res.json({
        success: true,
        message: "OTP sent successfuly"
    })
}

async function verifyOtp(req: Request, res: Response): Promise<void> {
    // await userService.verifyOtpAndLogin({
    //     phone: req.body.phone,
    //     otp: req.body.otp
    // })

    const userAgent = req.headers["user-agent"]

    if (!userAgent) {
        throw new AppError("User-Agent header is required", 400);
    }

    let deviceId = req.cookies.deviceId
    if (!deviceId) {
        deviceId = randomUUID()
    }

    const { user, accessToken, refreshToken } = await userService.createUserAndToken(req.body.phone, userAgent, deviceId)

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh-token",
        maxAge: 1000 * 60 * 60 * 24 * 15
    })

    res.cookie("deviceId", deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 365
    })

    res.json({
        success: true,
        message: "OTP verified successfully",
        accessToken,
        user
    })
}

async function logOut(req: Request, res: Response) {
    const user = checkRequest(req)
    const deviceId = req.cookies.deviceId

    if (!deviceId) {
        throw new AppError("device session not found", 403)
    }

    await userService.revokeUserToken(user.id, deviceId)

    res.clearCookie("refreshToken", {
        path: "/auth/refresh-token",
    })

    res.json({
        success: true,
        message: "user logged out successfully, please remove access token"
    })
}

export {
    sendOtp,
    verifyOtp,
    logOut
}