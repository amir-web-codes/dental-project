import type { NextFunction, Request, Response } from "express"
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

async function updateUserProfile(req: Request, res: Response, next: NextFunction) {
    // const data = await userService(req.body)

    res.status(201).json({
        success: true,
        message: "user updated successfully",
        // data
    })
}

export {
    getUserProfile,
    updateUserProfile
}