import { Request, Response, NextFunction } from 'express';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role?: string;
            };
        }
    }
}

export const requireGatewayAuth = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            error: 'Acceso denegado: Petición huérfana. Falta identificador del Gateway.',
        });
    }

    // 🛡️ FIX: Guardamos los datos de forma aislada, sin tocar el req.body
    req.user = {
        id: userId,
        role: typeof userRole === 'string' ? userRole : undefined,
    };

    next();
};
