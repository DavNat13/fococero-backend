import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { UserRepository } from '../repositories/user.repository';
import { UserStatus } from '../models/user.enum';

/**
 * Middleware: Autenticación con Firebase y PostgreSQL
 * Intercepta cada petición privada, valida la firma criptográfica de Google y 
 * recupera el perfil del usuario de la base de datos.
 */
export const validateFirebaseToken = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Extraer el token de los headers HTTP
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, msg: 'Acceso denegado: Token Bearer no proporcionado.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 2. Verificar criptográficamente el token con Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 3. Buscar al usuario en PostgreSQL (Corregido para usar el método exacto)
        const user = await UserRepository.findByFirebaseUid(decodedToken.uid); 

        if (!user) {
            res.status(403).json({ 
                ok: false, 
                msg: 'Identidad de Google válida, pero el usuario no está registrado en el ecosistema FocoCero.' 
            });
            return;
        }

        // 🚨 4. PROTECCIÓN ENTERPRISE: Verificar si el usuario está bloqueado o suspendido
        if (user.estado !== UserStatus.ACTIVO) {
            res.status(403).json({
                ok: false,
                msg: `Cuenta inhabilitada. Estado actual: ${user.estado}. Contacte a soporte técnico.`
            });
            return;
        }

        // 5. Inyectar el usuario en la request para que el Controlador y el RoleMiddleware lo usen
        (req as any).user = user;

        // 6. Ceder el paso
        next();
    } catch (error: any) {
        // Derivar al manejador de errores global
        next(error);
    }
};