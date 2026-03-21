import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { UserRepository } from '../repositories/user.repository';

export const validateFirebaseToken = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Extraer el token de los headers 
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, msg: 'Acceso denegado: No se proporcionó un token válido' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 2. Verificar el token directamente con los servidores de Google (Firebase)
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 3. Buscar al usuario en PostgreSQL usando el UID de Firebase
        const user = await UserRepository.findByFirebaseUidOrRut(decodedToken.uid, ''); 

        if (!user) {
            res.status(403).json({ ok: false, msg: 'Usuario autenticado en Firebase, pero no registrado en la base de datos de FocoCero' });
            return;
        }

        // 4. Inyectar el usuario en la request
        req.user = user;

        // 5. Dejarlo pasar a la siguiente función (el controlador)
        next();
    } catch (error: any) {
        // Si el token falló o expiró, lo mandamos al error.middleware.ts que acabamos de optimizar
        next(error);
    }
};