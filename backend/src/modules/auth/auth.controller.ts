import type { Request, Response } from "express"

import * as userService from "./auth.service"

async function login(req: Request, res: Response): Promise<void> {
    await userService.sendOtp(req.body.phone)

    res.json({
        success: true,
        message: "Logged in successfully"
    })
}

export {
    login
}