import morgan from 'morgan';
import { logger } from '../winston/winstonConfig';

export const morganMiddleware = morgan(
    function (tokens, req, res) {
        return JSON.stringify({
            method: tokens.method(req, res),
            uri: tokens.url(req, res),
            status: tokens.status(req, res),
            content_length: tokens.res(req, res, 'content-length'),
            response_time: Number.parseFloat(tokens['response-time'](req, res) || '')
        })
    },
    {
        stream: {
            write: (message) => {
                const data = JSON.parse(message);
                if (data.status >= 400) {
                    logger.http(data);
                }
            }
        }
    }
)