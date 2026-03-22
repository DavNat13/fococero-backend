import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Manejador Global de Errores (Error Catcher)
 * Evita que la aplicación colapse (crash) centralizando las respuestas de error.
 */
export const errorHandler = (
    err: any, 
    _req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    // 1. Log interno del servidor (Para trazabilidad en Docker/AWS)
    console.error(`🚨 [Error Global Handler]:`, err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor. Contacte al equipo de FocoCero.';

    // --- 🟢 EVALUACIÓN DE ERRORES FIREBASE ---
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401; 
        
        switch (err.code) {
            case 'auth/id-token-expired':
                message = 'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.';
                break;
            case 'auth/argument-error':
            case 'auth/invalid-id-token':
                message = 'El token de acceso proporcionado está corrupto o es inválido.';
                break;
            case 'auth/user-not-found':
                message = 'La credencial vinculada a este token ya no existe en los registros de Google.';
                break;
            default:
                message = 'Fallo en la validación de identidad. Verifica tus credenciales.';
        }
    }

    // --- 🔵 EVALUACIÓN DE ERRORES POSTGRESQL (pg) ---
    // Código 23505 = unique_violation (Ej: Se intenta registrar un RUT o Email duplicado)
    if (err.code === '23505') {
        statusCode = 409; // 409 Conflict
        message = 'Conflicto de datos: El registro que intentas ingresar ya existe en el sistema.';
    }
    
    // Código 22P02 = invalid_text_representation (Ej: Enviar texto donde va un número)
    if (err.code === '22P02') {
        statusCode = 400; // 400 Bad Request
        message = 'Formato de datos incorrecto en la base de datos (Ej: Letras en campo numérico).';
    }

    // --- 🔴 RESPUESTA ESTANDARIZADA AL FRONTEND ---
    res.status(statusCode).json({
        ok: false,
        error: message
    });
};