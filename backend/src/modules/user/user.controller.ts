import type { Request, Response } from "express";
import * as userService from "./user.service";
import checkRequest from "../../utils/checkRequest";

async function getUserProfile(req: Request, res: Response): Promise<void> {
    const user = checkRequest(req)
    const data = await userService.getUserProfile(user.id);

    res.json({
        success: true,
        message: "profile fetched successfully",
        data
    });
}

async function updateUserProfile(req: Request, res: Response): Promise<void> {
    const user = checkRequest(req)
    const data = await userService.updateUserProfile(user.id, req.body);

    res.json({
        success: true,
        message: "profile updated successfully",
        data
    });
}

export {
    getUserProfile,
    updateUserProfile
};