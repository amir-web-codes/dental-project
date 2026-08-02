import express, { type Request, Response, NextFunction } from "express"
const router = express.Router()

import { checkToken, checkRole } from "../../middlewares"
import * as userController from "./user.controller"

router.route("/me")
    .get(checkToken, userController.getUserProfile)

export default router