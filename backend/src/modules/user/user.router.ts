import express from "express";
const router = express.Router();

import { checkRole, checkToken, checkUserBan, validator } from "../../middlewares";
import * as validations from "./user.validation";
import * as userController from "./user.controller";

router.route("/me")
    .get(checkToken, userController.getUserProfile)
    .patch(checkToken, checkUserBan, validator(validations.updateProfileSchema, "body"), userController.updateUserProfile);

router.route("/admin/:id")
    .get(checkToken, checkUserBan, checkRole(["ADMIN"]), validator(validations.includeDeletedSchema, "query"), userController.getUserDetailForAdmin)
    .delete(checkToken, checkUserBan, checkRole(["ADMIN"]), userController.deleteUserById)

export default router;