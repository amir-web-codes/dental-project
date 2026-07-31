import express, { type Request, Response, NextFunction } from "express"
const router = express.Router()

import * as userController from "./user.controller"

export default router