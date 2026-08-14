import express from "express";
const router = express.Router();

import { checkToken, checkUserBan, checkRole, checkProfileCompleted, optionalCheckToken, validator } from "../../middlewares";
import * as validations from "./dentist.validation";
import * as dentistController from "./dentist.controller";
import * as limiters from "./dentist.ratelimiter";

router.get("/get-all", optionalCheckToken, validator(validations.listDentistsSchema, "query"), dentistController.listDentists);

router.route("/me")
    .get(checkToken, checkUserBan, checkRole(["DENTIST"]), dentistController.getMyProfile)
    .patch(checkToken, checkUserBan, checkRole(["DENTIST"]), validator(validations.updateSelfDentistSchema), dentistController.updateMyProfile);

router.post(
    "/me/request-verification",
    checkToken,
    checkUserBan,
    checkRole(["DENTIST"]),
    checkProfileCompleted,
    limiters.requestVerificationLimiter,
    dentistController.requestVerification
);

router.patch(
    "/admin/:id/verification",
    checkToken,
    checkRole(["ADMIN"]),
    limiters.adminVerificationLimiter,
    validator(validations.reviewDentistVerificationSchema),
    dentistController.reviewVerification
);

export default router;