import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/envs';
import { AppError } from '../helpers/AppError';

/**
 * Middleware de Seguridad Zero-Trust.
 * Verifica que la petición provenga internamente del API Gateway
 * o de otro microservicio autorizado de FocoCero, y no de la red pública.
 */
export const internalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    // Solo aplicamos esta restricción en rutas de negocio, no en health checks
    if (req.path === '/health') {
        return next();
    }

    const internalToken = req.headers['x-internal-token'];

    if (!internalToken || internalToken !== envs.INTERNAL_SECRET_TOKEN) {
        // Usamos un AppError para que el globalErrorHandler lo procese limpiamente
        throw new AppError('Acceso denegado: Petición interna no autorizada', 403);
    }

    next();
};
