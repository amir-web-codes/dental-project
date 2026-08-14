import express from "express"

import loadMiddlewares from "./configs/middlewares"

const app = express();

loadMiddlewares(app);

import authRouter from "./modules/auth/auth.router"
import userRouter from "./modules/user/user.router"
import dentistRouter from "./modules/dentist/dentist.router"

app.use("/auth", authRouter)
app.use("/users", userRouter)
app.use("/dentists", dentistRouter)

import type { Request, Response, NextFunction } from "express";
import AppError from "./errors/AppError";

app.use((req: Request, res: Response, next: NextFunction) => {
    throw new AppError("route not found", 404)
})


import errorHandler from "./middlewares/errorHandler"
app.use(errorHandler);

export default app;