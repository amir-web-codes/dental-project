import express from "express";
const router = express.Router();

import { checkRole, checkToken, checkUserBan, checkProfileCompleted, validator } from "../../middlewares";
import * as validations from "./user.validation";
import * as userController from "./user.controller";
import * as limiters from "./user.limiter"

router.route("/me")
    .get(checkToken, userController.getUserProfile)
    .patch(checkToken, checkUserBan, validator(validations.updateProfileSchema, "body"), userController.updateUserProfile);

router.route("/admin/:id")
    .get(checkToken, checkUserBan, checkRole(["ADMIN"]), validator(validations.includeDeletedSchema, "query"), userController.getUserDetailForAdmin)
    .delete(checkToken, checkUserBan, checkRole(["ADMIN"]), userController.deleteUserById)

router.patch("/:id/role", limiters.adminSensitiveActionLimiter, validator(validations.changeRoleSchema), userController.changeUserRole);

router.patch("/:id/ban", limiters.adminSensitiveActionLimiter, validator(validations.banUserSchema), userController.banUser);

router.post("/requests/create", checkToken, checkUserBan, checkProfileCompleted, limiters.createRequestLimiter, validator(validations.createRequestSchema), userController.createRequest);

router.get("/admin/requests/get-all", checkToken, checkRole(["ADMIN"]), validator(validations.listRequestsSchema, "query"), userController.listRequests);

router.route("/admin/requests/:id")
    .get(checkToken, checkRole(["ADMIN"]), userController.getRequestById)
    .patch(checkToken, checkRole(["ADMIN"]), limiters.reviewRequestLimiter, validator(validations.reviewRequestSchema), userController.reviewRequest);

export default router;