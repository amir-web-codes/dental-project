import type { Request, Response } from "express"

import * as userService from "./auth.service"

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
    //     otp: req.body.otp,
    //     // fullName: req.body.fullName
    // })

    res.json({
        success: true,
        message: "OTP verified successfully"
    })
}

export {
    sendOtp,
    verifyOtp
}