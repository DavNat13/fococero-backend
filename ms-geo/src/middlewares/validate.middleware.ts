// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware: Validador Universal de Esquemas.
 * Detecta fallos en Body, Query o Params antes de llegar al controlador.
 */
export const validateSchema = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Zod procesa y limpia los datos (ej: transforma strings de query a números)
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const detailedErrors = error.issues.map((issue) => ({
                    campo: issue.path.join(' > '),
                    mensaje: issue.message,
                }));

                res.status(400).json({
                    ok: false,
                    error: 'Validación fallida: El payload no cumple con el protocolo de FocoCero.',
                    detalles: detailedErrors,
                });
                return;
            }

            next(error);
        }
    };
};
