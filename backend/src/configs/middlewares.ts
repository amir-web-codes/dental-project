import express from "express"
import type { Express } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import corsOptions from "./cors"
import globalRateLimiter from "./rateLimiter"
import helmet from "helmet"
import morgan from "morgan"
import requestId from "../utils/requestId"
import path from "path"

export default function (app: Express) {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors(corsOptions));
    app.use(helmet());
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }
    app.use(globalRateLimiter);
    app.use(requestId);
    app.use(express.static(path.join(__dirname, "../public")))

}