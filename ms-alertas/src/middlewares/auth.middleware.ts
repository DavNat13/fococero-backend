// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

/**
 * Middleware: Autenticación Operativa (Zero Trust)
 * Valida estrictamente la firma criptográfica del Token JWT mediante Firebase Admin.
 */
export const validateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                ok: false,
                error: 'Acceso denegado: Token Bearer no proporcionado.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verificación criptográfica real. Si falla, lanza un error que captura el catch.
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Tipado estricto gracias a Declaration Merging. Cero uso de 'any'.
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email ?? '',
            rol: decodedToken.rol || 'CIUDADANO',
        };

        next();
    } catch (error: unknown) {
        // Delegamos el error al middleware global de errores
        next(error);
    }
};