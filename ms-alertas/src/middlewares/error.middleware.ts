// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Manejador Global de Errores para ms-alertas
 * Atrapa cualquier excepción no controlada en controladores o servicios.
 */
export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction): void => {
    // Log interno para los desarrolladores/sysadmins
    console.error(`🚨 [Alertas Error]:`, err.message || err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno en el sistema de alertas de FocoCero.';

    // --- 🟢 TRADUCCIÓN DE ERRORES FIREBASE (Auth) ---
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401;
        if (err.code === 'auth/id-token-expired') {
            message = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.';
        } else {
            message = 'Token de acceso inválido o corrupto.';
        }
    }

    // --- 🔵 TRADUCCIÓN DE ERRORES POSTGRESQL / POSTGIS ---
    if (err.code === '22P02') {
        statusCode = 400;
        message = 'Formato de datos incorrecto para la base de datos de alertas.';
    }

    if (err.code === 'XX000') {
        statusCode = 400;
        message = 'Error de topología: La ubicación de la alerta no es válida.';
    }

    // --- 🛡️ RESPUESTA ESTANDARIZADA ---
    res.status(statusCode).json({
        ok: false,
        error: message,
    });
};
