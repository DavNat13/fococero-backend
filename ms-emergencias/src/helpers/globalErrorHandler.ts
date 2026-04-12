import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { envs } from '../config/envs';

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    err.statusCode = err.statusCode || 500;

    if (envs.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            ok: false,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }

    // Usamos el import de AppError para validar el tipo de error
    if (err instanceof AppError || err.isOperational) {
        return res.status(err.statusCode).json({
            ok: false,
            message: err.message,
        });
    }

    console.error('🚨 ERROR CRÍTICO:', err);
    return res.status(500).json({
        ok: false,
        message: 'Algo salió muy mal en el servidor',
    });
};
