import express from "express"

import loadMiddlewares from "./configs/middlewares"
// import errorHandler from "./middlewares/errorHandler"

const app = express();

loadMiddlewares(app);
// app.use(errorHandler);

export default app;