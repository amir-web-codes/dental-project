const express = require("express");

const loadMiddlewares = require("./configs/middlewares");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

loadMiddlewares(app);

app.use(errorHandler);

module.exports = app;