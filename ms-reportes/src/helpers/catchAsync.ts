// src/helpers/catchAsync.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Higher-Order Function que elimina la necesidad de usar try/catch en los controladores.
 * Atrapa cualquier Promesa rechazada y la pasa al Error Middleware global.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => unknown) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
