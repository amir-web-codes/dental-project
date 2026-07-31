import express, { type Request, Response, NextFunction } from "express"
const router = express.Router()

import * as userController from "./auth.controller"

router.post("/signup", userController.login)

export default router