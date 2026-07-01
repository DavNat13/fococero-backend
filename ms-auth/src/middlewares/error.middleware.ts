// ms-auth/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Interfaz local para castear los metadatos de error sin usar 'any'
interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}

/**
 * Middleware: Manejador Global de Errores (Error Catcher)
 * Evita que la aplicación colapse centralizando las respuestas de error.
 */
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // Casteo seguro de la excepción
    const error = err as AppError;

    // 1. Log interno del servidor (Para trazabilidad)
    logger.error({ err: error }, `🚨 [Error Global Handler ms-auth]`);

    let statusCode = 500;
    let message = 'Error interno del servidor. Contacte al equipo de FocoCero.';

    // Solo los errores operacionales (AppError) tienen mensajes para el cliente
    if (error.isOperational) {
        statusCode = error.statusCode || 500;
        message = error.message || message;

        // --- 🟢 EVALUACIÓN DE ERRORES FIREBASE ---
        if (error.code && error.code.startsWith('auth/')) {
            statusCode = 401;
            switch (error.code) {
                case 'auth/id-token-expired':
                    message =
                        'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.';
                    break;
                case 'auth/argument-error':
                case 'auth/invalid-id-token':
                    message = 'El token de acceso proporcionado está corrupto o es inválido.';
                    break;
                case 'auth/user-not-found':
                    message =
                        'La credencial vinculada a este token ya no existe en los registros de Google.';
                    break;
                default:
                    message = 'Fallo en la validación de identidad. Verifica tus credenciales.';
            }
        }

        // --- 🔵 EVALUACIÓN DE ERRORES POSTGRESQL (pg) ---
        if (error.code === '23505') {
            statusCode = 409; // 409 Conflict
            message =
                'Conflicto de datos: El registro (RUT o Email) que intentas ingresar ya existe en el sistema.';
        }

        if (error.code === '22P02') {
            statusCode = 400; // 400 Bad Request
            message = 'Formato de datos incorrecto en la base de datos (Ej: UUID inválido).';
        }
    }

    res.status(statusCode).json({
        ok: false,
        error: message,
    });
};
