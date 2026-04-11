// ms-multimedia/src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware genérico para validar cualquier petición usando esquemas de Zod.
 * Atrapa datos faltantes o incorrectos antes de que lleguen al Controlador.
 */
export const validateSchema =
    (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validamos el contenido del body, query o params contra el esquema
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Formateamos los errores de Zod para que sean legibles en el Frontend
                const formatErrors = error.errors.map((err) => ({
                    campo: err.path.join('.'),
                    mensaje: err.message,
                }));

                return res.status(400).json({
                    error: 'Datos de formulario inválidos o faltantes.',
                    detalles: formatErrors,
                });
            }
            return next(error);
        }
    };
