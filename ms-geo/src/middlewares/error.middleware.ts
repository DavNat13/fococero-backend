// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../helpers/appError';
import { logger } from '../config/logger';

/**
 * Middleware: Manejador Global de Errores para ms-geo
 * Centraliza la captura de excepciones, traduce errores de infraestructura (Firebase/PostGIS)
 * y garantiza una respuesta estandarizada al cliente.
 */
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // 1. Valores por defecto para errores no controlados
    let statusCode = 500;
    let message = 'Error interno en el motor espacial de FocoCero.';
    let internalCode = 'INTERNAL_SERVER_ERROR';

    // 2. Procesamiento de errores según su origen
    if (err instanceof AppError) {
        // Errores operativos lanzados intencionalmente por nuestra lógica de negocio
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        const errorWithCode = err as Error & { code?: string; statusCode?: number };

        // Log interno para depuración (Solo visible en consola de Docker/Terminal)
        logger.error({ err }, `🚨 [Geo Engine Error]`);

        // --- 🟢 TRADUCCIÓN DE ERRORES FIREBASE (Autenticación) ---
        if (errorWithCode.code?.startsWith('auth/')) {
            statusCode = 401;
            internalCode = 'AUTH_ERROR';
            switch (errorWithCode.code) {
                case 'auth/id-token-expired':
                    message = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.';
                    break;
                case 'auth/invalid-id-token':
                    message = 'El token proporcionado no es válido.';
                    break;
                default:
                    message = 'Error de autenticación: Credenciales inválidas o corruptas.';
            }
        }

        // --- 🔵 TRADUCCIÓN DE ERRORES POSTGRESQL / POSTGIS ---
        if (errorWithCode.code) {
            internalCode = `DB_ERROR_${errorWithCode.code}`;
            switch (errorWithCode.code) {
                case '22P02': // Invalid text representation
                    statusCode = 400;
                    message = 'Formato de datos incorrecto para la base de datos espacial.';
                    break;
                case 'XX000': // Internal PostGIS Error
                    statusCode = 400;
                    message =
                        'Error de topología: Las coordenadas o el polígono proporcionado no son válidos.';
                    break;
                case '23505': // Unique violation
                    statusCode = 409;
                    message = 'Ya existe un registro con estos datos únicos.';
                    break;
                case '23503': // Foreign key violation
                    statusCode = 400;
                    message =
                        'Error de integridad: Referencia a una categoría o reporte inexistente.';
                    break;
            }
        }

        // Si el error traía un statusCode pre-asignado (ej. por alguna librería)
        if (errorWithCode.statusCode) statusCode = errorWithCode.statusCode;
    }

    // 3. 🛡️ RESPUESTA ESTANDARIZADA
    // Mantenemos el contrato definido en Swagger (ok: false)
    res.status(statusCode).json({
        ok: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            debug: {
                code: internalCode,
                stack: err instanceof Error ? err.stack : undefined,
            },
        }),
    });
};
