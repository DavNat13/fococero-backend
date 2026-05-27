import { Request, Response, NextFunction } from 'express';
import { AppError } from '../helpers/AppError';

const MAX_EXECUTION_TIME_MS = 15000;

export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const controller = new AbortController();
    req.signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
        const error = new AppError(
            'Timeout: El proceso tomó demasiado tiempo y fue abortado por seguridad',
            408,
        );
        next(error);
    }, MAX_EXECUTION_TIME_MS);

    res.on('finish', () => {
        clearTimeout(timeoutId);
    });

    res.setTimeout(MAX_EXECUTION_TIME_MS, () => {
        if (!res.headersSent) {
            res.status(408).json({ ok: false, message: 'Request Timeout' });
        }
    });

    next();
};
