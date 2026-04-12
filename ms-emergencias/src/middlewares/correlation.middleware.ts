import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware de Trazabilidad Distribuida.
 * Garantiza que cada petición tenga un ID único que pueda ser rastreado
 * a través de todos los microservicios de FocoCero.
 */
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Buscar el ID en los headers (enviado por API Gateway u otro MS)
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

    // Inyectar en el objeto Request (gracias a nuestra extensión en @types)
    req.correlationId = correlationId;

    // Adjuntar a la respuesta para que el cliente/frontend también lo tenga
    res.setHeader('X-Correlation-ID', correlationId);

    next();
};
