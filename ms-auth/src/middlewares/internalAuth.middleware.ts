/**
 * @fileoverview Middleware de autenticación interna para comunicación entre microservicios.
 * Valida el header x-internal-token contra el secreto compartido definido en variables de entorno.
 * Omite rutas de health check y métricas.
 */

import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/envs';

/**
 * Middleware que valida el token interno de comunicación entre servicios.
 * Requiere header x-internal-token coincidente con INTERNAL_SECRET_TOKEN.
 * Las rutas /health y /metrics están exentas de autenticación.
 *
 * @param req - Objeto de solicitud Express
 * @param res - Objeto de respuesta Express
 * @param next - Función next de Express
 */
export const internalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/health' || req.path === '/metrics' || req.path === '/api/health') {
        return next();
    }

    const internalToken = req.headers['x-internal-token'];

    if (!internalToken || internalToken !== envs.INTERNAL_SECRET_TOKEN) {
        res.status(401).json({
            ok: false,
            error: 'Acceso denegado: Petición interna no autorizada.',
        });
        return;
    }

    next();
};
