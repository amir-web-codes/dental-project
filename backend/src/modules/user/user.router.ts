import express from "express";
const router = express.Router();

import { checkToken, checkUserBan, validator } from "../../middlewares";
import { updateProfileSchema } from "./user.validation";
import * as userController from "./user.controller";

router.route("/me")
    .get(checkToken, userController.getUserProfile)
    .patch(checkToken, checkUserBan, validator(updateProfileSchema), userController.updateUserProfile);

export default router;