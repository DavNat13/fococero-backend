import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.enum';

/**
 * Middleware: Autorización Basada en Roles (RBAC)
 * Evalúa si el usuario autenticado tiene los privilegios necesarios para ejecutar una acción.
 * * @param allowedRoles Arreglo con los roles permitidos (Ej: [UserRole.ADMIN, UserRole.BRIGADISTA])
 */
export const authorizeRole = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Extraemos el usuario que fue inyectado previamente por auth.middleware.ts
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({ 
                ok: false, 
                msg: 'Acceso denegado: Identidad no verificada en el flujo.' 
            });
            return;
        }

        // Verificamos si el rol del usuario está dentro de la lista de roles permitidos
        if (!allowedRoles.includes(user.rol)) {
            res.status(403).json({ 
                ok: false, 
                msg: `Acceso denegado: Requiere nivel de privilegio superior. Tu rol actual es '${user.rol}'.` 
            });
            return;
        }

        // Si pasa la validación, continúa hacia el Controlador
        next();
    };
};