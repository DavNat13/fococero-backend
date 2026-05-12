// ==========================================
// 🛡️ Middlewares de Validacion
// ==========================================
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: z.ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(new AppError(`Validation failed: ${messages}`, 400));
            } else {
                next(error);
            }
        }
    };
};