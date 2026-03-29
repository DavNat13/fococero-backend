// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Manejador Global de Errores para ms-geo
 * Atrapa cualquier excepción no controlada en controladores o servicios.
 */
export const errorHandler = (
    err: any, 
    _req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    // Log interno para los desarrolladores/sysadmins
    console.error(`🚨 [Geo Error]:`, err.message || err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno en el motor espacial de FocoCero.';

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
        message = 'Formato de datos incorrecto para la base de datos espacial.';
    }

    // Error específico de PostGIS por geometría inválida o coordenadas imposibles
    if (err.code === 'XX000') {
        statusCode = 400;
        message = 'Error de topología: Las coordenadas o el polígono proporcionado no son válidos.';
    }

    // --- 🛡️ RESPUESTA ESTANDARIZADA (Fail-Safe) ---
    // Siempre devolvemos la misma estructura que prometimos en Swagger
    res.status(statusCode).json({
        ok: false,
        error: message
    });
};