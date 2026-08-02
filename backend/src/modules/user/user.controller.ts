import type { Request, Response } from "express"
import * as userService from "./user.service"
import type { UserProfileDto } from "./user.dto"

async function getUserProfile(req: Request, res: Response) {
    const data = await userService.getUserById(req.user.id)

    res.json({
        success: true,
        message: "user fetched successfully",
        data
    })

    return data
}

export {
    getUserProfile
}