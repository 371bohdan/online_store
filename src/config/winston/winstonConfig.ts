import winston from "winston";
import { ENV } from "../dotenv/env";
const { combine, timestamp, json } = winston.format;

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: ENV.LOG_LEVEL,
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.File({
            filename: 'logs/http-error-logs (400-500).log',
            level: 'http'
        }),

        new winston.transports.File({
            filename: 'logs/error-errorHandler.log',
            level: 'error'
        }),

        new winston.transports.File({
            filename: 'logs/warn-auth.log',
            level: 'warn'
        })
    ]
});