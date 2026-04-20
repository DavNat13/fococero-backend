import { Request, Response, NextFunction } from 'express';
import { AppError } from '../helpers/AppError';

const MAX_EXECUTION_TIME_MS = 15000; // 15 segundos máximo por petición

/**
 * Middleware de Timeout (Fail-Fast).
 * Protege el Event Loop de Node.js cortando peticiones que tarden demasiado,
 * evitando que un cuello de botella tumbe todo el contenedor Docker.
 */
export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Configuramos el timeout a nivel de red
    req.setTimeout(MAX_EXECUTION_TIME_MS, () => {
        const error = new AppError(
            'Timeout: El proceso tomó demasiado tiempo y fue abortado por seguridad',
            408,
        );
        next(error);
    });

    res.setTimeout(MAX_EXECUTION_TIME_MS, () => {
        // Si Express intenta escribir en una respuesta que ya hizo timeout
        if (!res.headersSent) {
            res.status(408).json({ ok: false, message: 'Request Timeout' });
        }
    });

    next();
};
