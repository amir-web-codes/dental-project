import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import env from "../utils/env";

const isProd = env("NODE_ENV") === "production";
const logsDir = path.join(__dirname, "../../logs");

const baseFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

function onlyLevel(level: string) {
    return winston.format((info) => (info.level === level ? info : false))();
}

function levelTransport(level: "error" | "warn" | "info") {
    return new DailyRotateFile({
        dirname: logsDir,
        filename: `${level}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(onlyLevel(level), baseFormat)
    });
}

const combinedTransport = new DailyRotateFile({
    dirname: logsDir,
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    format: baseFormat
});

const transports: winston.transport[] = [
    levelTransport("error"),
    levelTransport("warn"),
    levelTransport("info"),
    combinedTransport
];

const logger = winston.createLogger({
    level: "info",
    transports
});

export default logger;