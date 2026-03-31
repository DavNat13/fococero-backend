// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase'; 

/**
 * Middleware: Autenticación Operativa para ms-geo
 * Valida la firma criptográfica del Token JWT de Firebase.
 */
export const validateFirebaseToken = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        // 🛡️ Escudo 1: Rechazo temprano si no hay formato Bearer o viene vacío (CRÍTICO)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ 
                ok: false, 
                error: 'Acceso denegado: Token Bearer no proporcionado u oculto en ms-geo.' 
            });
            return; // 🛑 Detiene la ejecución aquí para evitar el error de .split()
        }

        const token = authHeader.split(' ')[1];

        // 🛡️ Escudo 2: Verificación criptográfica en tiempo real
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Inyectamos la información básica en la request de forma segura
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };

        next();
    } catch (error: any) {
        // Auto-Healing: Si el token expiró o es alterado, lo atrapa el manejador global
        next(error); 
    }
};