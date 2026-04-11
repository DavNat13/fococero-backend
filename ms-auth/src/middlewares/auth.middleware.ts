// ms-auth/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { UserRepository } from '../repositories/user.repository';
import { UserStatus } from '../models/user.enum'; // Asegúrate de que esta ruta sea correcta

/**
 * Middleware: Autenticación Operativa (Identity Provider)
 * Intercepta peticiones privadas, valida la firma criptográfica de Google y
 * recupera el perfil completo del usuario de la base de datos (PostgreSQL).
 */
export const validateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // 1. Escudo Perimetral: Rechazo temprano si no hay token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                ok: false,
                msg: 'Acceso denegado: Token Bearer no proporcionado.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 2. Escudo Criptográfico: Verificación contra los servidores de Google
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 3. Escudo de Identidad Local: Buscar al usuario en nuestro PostgreSQL
        const user = await UserRepository.findByFirebaseUid(decodedToken.uid);

        if (!user) {
            res.status(403).json({
                ok: false,
                msg: 'Identidad de Google válida, pero el usuario no está registrado en el ecosistema FocoCero.',
            });
            return;
        }

        // 4. Protección Enterprise: Verificar ciclo de vida del usuario
        if (user.estado !== UserStatus.ACTIVO) {
            res.status(403).json({
                ok: false,
                msg: `Cuenta inhabilitada. Estado actual: ${user.estado}. Contacte a soporte técnico.`,
            });
            return;
        }

        // 5. Inyección Tipada: Delegamos el objeto 'Usuario' completo a la Request.
        // Gracias a tu index.d.ts, TypeScript autocompletará req.user en los controladores.
        req.user = user;

        next();
    } catch (error: unknown) {
        // Delegamos errores de caducidad o falsificación al error.middleware.ts
        next(error);
    }
};
