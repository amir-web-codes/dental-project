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



router.post("/requests/create", checkToken, checkUserBan, checkProfileCompleted, limiters.createRequestLimiter, validator(validations.createRequestSchema), userController.createRequest);

router.get("/requests/get-all", checkToken, checkRole(["ADMIN"]), validator(validations.listRequestsSchema, "query"), userController.listRequests);


export default router;