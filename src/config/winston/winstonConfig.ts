import winston from "winston";
import { ENV } from "../dotenv/env";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
const { combine, timestamp, json } = winston.format;
import DailyRotateFile from "winston-daily-rotate-file";

const logtail = new Logtail(ENV.LOGTAIL_TOKEN, {
    endpoint: ENV.LOGTAIL_ENDPOINT
});

const prodTransports = [
    new LogtailTransport(logtail)
]

const localTransports = [
    new DailyRotateFile({
        filename: 'logs/http/http-error-logs-(400-500)-%DATE%.log',
        datePattern: 'DD-MM-YYYY',
        level: 'http',
        maxFiles: '14d',
        auditFile: 'logs/audits/.http-audit.json'
    }),

    new DailyRotateFile({
        filename: 'logs/errorHandler/error-errorHandler-%DATE%.log',
        datePattern: 'DD-MM-YYYY',
        level: 'error',
        maxFiles: '14d',
        auditFile: 'logs/audits/.error-audit.json'
    }),

    new DailyRotateFile({
        filename: 'logs/warning/warn-auth-%DATE%.log',
        datePattern: 'DD-MM-YYYY',
        level: 'warn',
        maxFiles: '14d',
        auditFile: 'logs/audits/.warn-audit.json'
    })
]

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: ENV.LOG_LEVEL,
    format: combine(timestamp(), json()),
    transports: ENV.HOST_URI.startsWith('https://') ? prodTransports : localTransports
});