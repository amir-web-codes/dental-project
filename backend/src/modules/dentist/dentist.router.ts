import express from "express";
const router = express.Router();

import { checkToken, checkUserBan, checkRole, checkProfileCompleted, optionalCheckToken, validator } from "../../middlewares";
import * as validations from "./dentist.validation";
import * as dentistController from "./dentist.controller";
import * as limiters from "./dentist.rateLimiter";

router.get("/get-all", optionalCheckToken, validator(validations.listDentistsSchema, "query"), dentistController.listDentists);

export default router;