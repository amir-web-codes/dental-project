import express from "express"
const router = express.Router()

import * as authController from "./auth.controller"
import * as validations from "./auth.validation"
import * as limiters from "./auth.rateLimiter"
import { checkToken, validator } from "../../middlewares"

router.post("/request-otp", validator(validations.sendOtpSchema, "body"), limiters.ipBasedOtpLimiter, limiters.phoneBasedOtpLimiter, authController.sendOtp)
router.post("/verify-otp", validator(validations.verifyOtpSchema, "body"), limiters.ipBasedOtpLimiter, limiters.phoneBasedOtpLimiter, authController.verifyOtp)
router.post("/logout", checkToken, authController.logOut)

export default router