import type { Request, Response } from "express";
import * as userService from "./user.service";
import checkRequest from "../../utils/checkRequest";
import validateId from "../../utils/validateId";

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

async function getUserDetailForAdmin(req: Request, res: Response): Promise<void> {
    const id = validateId(req)
    const deleted = req.params.includeDeleted ? true : false

    const data = await userService.getUserDetailForAdmin(id, { includeDeleted: deleted })

    res.json({
        success: true,
        message: "user fetched successfully",
        data
    })
}

async function deleteUserById(req: Request, res: Response) {
    const id = validateId(req)
    const user = checkRequest(req)
    const data = await userService.deleteUserById(id, user.id)

    res.json({
        success: true,
        message: "user deleted successfully",
        data
    })
}

export {
    getUserProfile,
    updateUserProfile,
    getUserDetailForAdmin,
    deleteUserById
};