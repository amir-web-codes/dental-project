import type { Request, Response } from "express"

import * as userService from "./auth.service"

async function sendOtp(req: Request, res: Response): Promise<void> {
    await userService.sendOtp(req.body.phone)

    res.json({
        success: true,
        message: "OTP was sent successfuly"
    })
}

export {
    sendOtp
}