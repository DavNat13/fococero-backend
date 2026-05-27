import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

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

/**
 * Extrae y verifica el token Bearer del header Authorization usando Firebase Admin.
 * 
 * Flujo de seguridad:
 * 1. Verifica que exista el header Authorization con formato "Bearer <token>"
 * 2. Verifica el token con Firebase Admin (valida firma, expiración, emisor, audiencia)
 * 3. Extrae el UID del token decodificado y lo asigna a req.user.id
 * 4. Mantiene compatibilidad con x-user-role para roles transferidos desde el Gateway
 */
export const requireGatewayAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 🔐 1. Priorizar verificación del token Firebase desde el header Authorization
        const authHeader = req.headers.authorization;

        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1]?.trim();

            if (token) {
                try {
                    // Verificar token con Firebase Admin SDK
                    const decodedToken = await admin.auth().verifyIdToken(token);
                    const userRole = req.headers['x-user-role'];

                    req.user = {
                        id: decodedToken.uid,
                        role: typeof userRole === 'string' ? userRole : undefined,
                    };

                    return next();
                } catch {
                    return res.status(401).json({
                        error: 'Acceso denegado: Token Firebase inválido o expirado.',
                    });
                }
            }
        }

        // ⚠️ 2. Fallback: confiar en los headers del Gateway (solo en desarrollo o detrás del API Gateway)
        const userId = req.headers['x-user-id'];
        const userRole = req.headers['x-user-role'];

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({
                error: 'Acceso denegado: Petición huérfana. Falta identificador del Gateway o token de autenticación.',
            });
        }

        // 🛡️ FIX: Guardamos los datos de forma aislada, sin tocar el req.body
        req.user = {
            id: userId,
            role: typeof userRole === 'string' ? userRole : undefined,
        };

        next();
    } catch {
        return res.status(500).json({
            error: 'Error interno de autenticación.',
        });
    }
};
