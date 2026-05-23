// src/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.enum';

/**
 * Middleware: Autorización Basada en Roles (RBAC)
 * Evalúa si el usuario autenticado tiene los privilegios necesarios.
 */
export const authorizeRole = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user; // Autocompletado nativo disponible

        if (!user) {
            res.status(401).json({
                ok: false,
                msg: 'Acceso denegado: Identidad no verificada.',
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
