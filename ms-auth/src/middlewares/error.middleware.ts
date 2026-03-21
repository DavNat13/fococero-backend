import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any, 
    _req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    // 1. Log interno para nosotros (puedes ver la traza completa en la consola)
    console.error(`🚨 [Error Global]:`, err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor. Contacte al administrador.';

    // --- OPTIMIZACIÓN FIREBASE ENTERPRISE ---
    // Firebase Admin SDK devuelve errores con una propiedad 'code' que empieza con 'auth/'
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401; // 401 Unauthorized
        
        switch (err.code) {
            case 'auth/id-token-expired':
                message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                break;
            case 'auth/argument-error':
            case 'auth/invalid-id-token':
                message = 'Token de autenticación inválido o corrupto.';
                break;
            case 'auth/user-not-found':
                message = 'El usuario asociado a este token ya no existe en Firebase.';
                break;
            default:
                message = 'Error de autenticación. Verifica tus credenciales.';
        }
    }

    // 2. Respuesta segura y estandarizada para el Frontend
    res.status(statusCode).json({
        ok: false,
        msg: message
    });
};