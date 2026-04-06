// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

/**
 * Middleware: Autenticación Operativa para ms-reportes
 * Valida la firma criptográfica del Token JWT de Firebase o utiliza el puente de desarrollo.
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
        // Permite saltar la validación real solo en entorno de desarrollo.
        if (process.env.NODE_ENV?.trim() === 'development' && token === 'fococero_test_token') {
            (req as any).user = {
                uid: 'master_admin_uid',
                email: 'comandante@fococero.cl',
                rol: 'ADMIN', // Desbloquea todas las funcionalidades administrativas
            };
            return next();
        }

        // 🛡️ Escudo 2: Verificación criptográfica real con Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Inyectamos la información en la request.
        // Soporta tanto 'uid' como 'firebase_uid' para consistencia entre microservicios.
        (req as any).user = {
            uid: decodedToken.uid || (decodedToken as any).firebase_uid,
            email: decodedToken.email,
            rol: decodedToken.rol || 'CIUDADANO', 
        };

        next();
    } catch (error: any) {
        // En caso de error de Firebase, el errorHandler global manejará el 403
        next(error);
    }
};