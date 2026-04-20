import { Request, Response, NextFunction } from 'express';
import { Logger } from '../helpers/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health') return next();

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const correlationId = req.correlationId || 'NO-ID';

        const message = `${req.method} ${req.originalUrl} - Status: ${status} - [${duration}ms] - ID: ${correlationId}`;

        if (status >= 500) {
            Logger.error(message, null, 'HTTP');
        } else if (status >= 400) {
            Logger.warn(message, 'HTTP');
        } else {
            Logger.info(message, 'HTTP');
        }
    });

    next();
};
