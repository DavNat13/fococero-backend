// ms-auth/src/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.enum';

/**
 * Middleware: Autorización Basada en Roles (RBAC)
 * Evalúa si el usuario autenticado tiene los privilegios necesarios para ejecutar una acción.
 */
export const authorizeRole = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // ✅ FIX: Autocompletado nativo y tipado estricto sin usar 'any'
        const user = req.user;

        if (!user) {
            res.status(401).json({
                ok: false,
                msg: 'Acceso denegado: Identidad no verificada en el flujo.',
            });
            return;
        }

        if (!allowedRoles.includes(user.rol as UserRole)) {
            res.status(403).json({
                ok: false,
                msg: `Acceso denegado: Requiere nivel de privilegio superior. Tu rol actual es '${user.rol}'.`,
            });
            return;
        }

        next();
    };
};
