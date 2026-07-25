const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
// const globalRateLimiter = require("./global.rateLimiter")
const corsOptions = require("./cors")
const requestId = require("../utils/requestId")
const path = require("path")

module.exports = function (app) {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors(corsOptions));
    app.use(helmet());
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }
    // app.use(globalRateLimiter);
    app.use(requestId);
    app.use(express.static(path.join(__dirname, "../public")))

}