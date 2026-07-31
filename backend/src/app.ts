import express from "express"

import loadMiddlewares from "./configs/middlewares"
// import errorHandler from "./middlewares/errorHandler"

const app = express();

loadMiddlewares(app);
// app.use(errorHandler);

import authRouter from "./modules/auth/auth.router"
import userRouter from "./modules/user/user.router"

app.use("/auth", authRouter)
app.use("/users", userRouter)

export default app;