// ms-reportes/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

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
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            rol: decodedToken.rol || 'USUARIO', 
        };

        next();
    } catch (_error: unknown) {
        next(_error);
    }
};
