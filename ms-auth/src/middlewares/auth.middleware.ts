// ms-auth/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { UserRepository } from '../repositories/user.repository';
import { UserStatus, UserRole } from '../models/user.enum';

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const validateFirebaseToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, msg: 'Acceso denegado.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Normalizamos el entorno quitando espacios accidentales
        const currentEnv = (process.env.NODE_ENV || 'development').trim();

        // 🟢 BYPASS DE DESARROLLO MEJORADO
        if (token === 'fococero_test_token' && currentEnv !== 'production') {
            req.user = {
                id: 999,
                firebase_uid: 'test-admin-uid',
                email: 'admin-test@fococero.cl',
                rol: UserRole.ADMIN,
                estado: UserStatus.ACTIVO,
            };
            return next();
        }

        // 🔴 VALIDACIÓN REAL (FIREBASE)
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (firebaseError: any) {
            res.status(401).json({
                ok: false,
                msg: 'Token inválido o el servidor está en modo producción.',
                error: firebaseError.code,
            });
            return;
        }

        const user = await UserRepository.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            res.status(403).json({ ok: false, msg: 'Usuario no registrado.' });
            return;
        }

        if (user.estado !== UserStatus.ACTIVO) {
            res.status(403).json({ ok: false, msg: 'Cuenta inactiva.' });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        res.status(500).json({ ok: false, msg: 'Error interno del servidor.' });
    }
};
