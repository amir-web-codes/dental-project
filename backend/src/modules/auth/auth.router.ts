import express, { type Request, Response, NextFunction } from "express"
const router = express.Router()

import * as userController from "./auth.controller"
import * as validations from "./auth.validation"
import * as limiters from "./auth.rateLimiter"
import { validator } from "../../middlewares"

router.post("/request-otp", validator(validations.sendOtpSchema, "body"), limiters.sendOtpLimiter, userController.sendOtp)

export default router