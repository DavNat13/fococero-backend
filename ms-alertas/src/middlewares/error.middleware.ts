// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Interfaz para tipar los errores que contienen metadatos adicionales
interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

/**
 * Middleware: Manejador Global de Errores
 * Atrapa cualquier excepción no controlada en controladores o servicios.
 */
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    const error = err as AppError;

    logger.error({ err: error }, `🚨 [Alertas Error]`);

    let statusCode = error.statusCode || 500;
    let message = error.message || 'Error interno en el sistema de alertas de FocoCero.';

    // --- TRADUCCIÓN DE ERRORES FIREBASE (Auth) ---
    if (error.code && error.code.startsWith('auth/')) {
        statusCode = 401;
        message =
            error.code === 'auth/id-token-expired'
                ? 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
                : 'Token de acceso inválido o corrupto.';
    }

    // --- TRADUCCIÓN DE ERRORES POSTGRESQL / POSTGIS ---
    if (error.code === '22P02') {
        statusCode = 400;
        message = 'Formato de datos incorrecto para la base de datos de alertas.';
    }

    res.status(statusCode).json({
        ok: false,
        error: message,
    });
};
