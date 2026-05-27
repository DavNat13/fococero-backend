import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { envs } from '../config/envs';
import { Logger } from './logger';

export const globalErrorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    // Casting seguro para acceder a las propiedades sin usar 'any'
    const error = err as Error & { statusCode?: number; isOperational?: boolean };
    const statusCode = error.statusCode || 500;

    if (envs.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            ok: false,
            message: error.message || 'Error desconocido',
            stack: error.stack,
            error: err,
        });
    }

    // Usamos el import de AppError para validar el tipo de error
    if (err instanceof AppError || error.isOperational) {
        return res.status(statusCode).json({
            ok: false,
            message: error.message,
        });
    }

    Logger.error('🚨 ERROR CRÍTICO:', err);
    return res.status(500).json({
        ok: false,
        message: 'Algo salió muy mal en el servidor',
    });
};
