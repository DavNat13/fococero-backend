// ==========================================
// 🚦 MIDDLEWARE: EJECUTOR DE VALIDACIONES ZOD
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Usamos safeParseAsync que es más seguro y amigable con TypeScript
        const resultado = await schema.safeParseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Si la validación falla, resultado.success es false
        if (!resultado.success) {
            // Accedemos a resultado.error.issues, que está 100% tipado por Zod
            const erroresFormateados = resultado.error.issues.map((err) => ({
                campo: err.path.join('.'),
                mensaje: err.message,
            }));

            res.status(400).json({
                ok: false,
                error: 'Error de validación en los datos enviados.',
                detalles: erroresFormateados,
            });
            return;
        }

        // Si los datos son correctos, pasamos al Controlador
        next();
    };
};
