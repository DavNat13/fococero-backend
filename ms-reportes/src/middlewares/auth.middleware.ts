// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

/**
 * Middleware: Autenticación Operativa para ms-reportes
 * Valida la firma criptográfica del Token JWT de Firebase.
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

        // 🛡️ Escudo 2: Verificación criptográfica
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Inyectamos la información en la request.
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            rol: decodedToken.rol || 'CIUDADANO', // Valor por defecto de seguridad
        };

        next();
    } catch (error: any) {
        next(error);
    }
};