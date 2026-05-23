// src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resultado = await schema.safeParseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!resultado.success) {
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

        next();
    };
};