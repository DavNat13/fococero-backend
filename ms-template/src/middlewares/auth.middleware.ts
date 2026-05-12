// ==========================================
// 🛡️ Middleware de Autenticacion (Placeholder)
// ==========================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

// ==========================================
// ⚠️ IMPLEMENTAR SEGUN NECESIDADES
// ==========================================
// Este es un ejemplo basico de autenticacion.
// En produccion, implementar JWT u otro metodo.

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    // const token = req.headers.authorization?.split(' ')[1];

    // if (!token) {
    //     return next(new AppError('Token no proporcionado', 401));
    // }

    // try {
    //     // Validar token y agregar usuario a req
    //     // req.user = verifyToken(token);
    //     next();
    // } catch {
    //     next(new AppError('Token invalido', 401));
    // }

    // Placeholder: permite todas las peticiones
    next();
};

export const authorize = (..._roles: string[]) => {
    return (_req: Request, _res: Response, next: NextFunction): void => {
        // Implementar logica de autorizacion por roles
        next();
    };
};