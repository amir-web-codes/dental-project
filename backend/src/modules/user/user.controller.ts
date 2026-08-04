import type { Request, Response } from "express"
import * as userService from "./user.service"
import type { UserProfileDto } from "./user.dto"

async function getUserProfile(req: Request, res: Response) {
    const data = await userService.getUserById(req.user.id)

    res.json({
        success: true,
        message: "User fetched successfully",
        data
    })
}

async function updateUserProfile(req: Request, res: Response) {
    const data = await userService.updateUserById(req.body, req.user.id)

    res.json({
        success: true,
        message: "User updated successfully",
        data
    })
}

export {
    getUserProfile,
    updateUserProfile
}