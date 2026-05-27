// ms-reportes/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    const error = err as AppError;
    logger.error({ err: error }, `🚨 [Reportes Error]`);

    let statusCode = error.statusCode || 500;
    let message = error.message || 'Error interno en el sistema de reportes de FocoCero.';

    if (error.code && error.code.startsWith('auth/')) {
        statusCode = 401;
        message =
            error.code === 'auth/id-token-expired'
                ? 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
                : 'Token de acceso inválido o corrupto.';
    }

    if (error.code === '22P02') {
        statusCode = 400;
        message = 'Formato de datos incorrecto para la base de datos de reportes.';
    }

    if (error.code === 'XX000') {
        statusCode = 400;
        message = 'Error de topología: La ubicación del reporte no es válida.';
    }

    res.status(statusCode).json({
        ok: false,
        error: message,
    });
};
