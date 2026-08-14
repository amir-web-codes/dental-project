import type { Request, Response } from "express";
import * as dentistService from "./dentist.service";
import type { DentistListQueryDto } from "./dentist.dto";
import checkRequest from "../../utils/checkRequest";
import validateId from "../../utils/validateId";

async function listDentists(req: Request, res: Response) {
    const isAdmin = req.user?.role === "ADMIN";
    const query = req.query as unknown as DentistListQueryDto;

    const { data, meta } = await dentistService.listDentists(query, isAdmin);

    res.json({
        success: true,
        message: "dentists fetched successfully",
        data,
        meta
    });
}

async function getMyProfile(req: Request, res: Response) {
    const user = checkRequest(req)
    const data = await dentistService.getMyDentistProfile(user.id);

    res.json({
        success: true,
        message: "dentist profile fetched successfully",
        data
    });
}

async function updateMyProfile(req: Request, res: Response) {
    const user = checkRequest(req)
    const data = await dentistService.updateMyDentistProfile(user.id, req.body);

    res.json({
        success: true,
        message: "dentist profile updated successfully",
        data
    });
}

async function requestVerification(req: Request, res: Response) {
    const user = checkRequest(req)
    const data = await dentistService.requestVerification(user.id);

    res.json({
        success: true,
        message: "verification request submitted successfully",
        data
    });
}

async function reviewVerification(req: Request, res: Response) {
    const id = validateId(req)
    const user = checkRequest(req)

    const data = await dentistService.reviewDentistVerification(id, user.id, req.body);
    res.json({
        success: true,
        message: "dentist verification reviewed successfully",
        data
    });
}

export {
    listDentists,
    getMyProfile,
    updateMyProfile,
    requestVerification,
    reviewVerification
};