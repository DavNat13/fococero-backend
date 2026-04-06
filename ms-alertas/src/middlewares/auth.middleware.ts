// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

/**
 * Middleware: Autenticación Operativa para ms-alertas
 * Valida la firma criptográfica del Token JWT de Firebase o usa el puente de desarrollo.
 */
export const validateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        // 🛡️ Escudo 1: Rechazo temprano si no hay token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                ok: false,
                error: 'Acceso denegado: Token Bearer no proporcionado.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 🟢 PUENTE PARA DESARROLLO (Master Token)
        // Permite usar el token de prueba solo si NODE_ENV es 'development'
        if (process.env.NODE_ENV?.trim() === 'development' && token === 'fococero_test_token') {
            (req as any).user = {
                uid: 'master_admin_uid',
                email: 'comandante@fococero.cl',
                rol: 'ADMIN', // Rol maestro para desbloquear todas las pruebas
            };
            return next();
        }

        // 🛡️ Escudo 2: Verificación criptográfica real con Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Inyectamos la información en la request.
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            rol: decodedToken.rol || 'CIUDADANO',
        };

        next();
    } catch (error: any) {
        // Si el token falla, el errorHandler enviará el mensaje de "Sesión expirada"
        next(error);
    }
};
    