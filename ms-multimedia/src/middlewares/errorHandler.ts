// ms-multimedia/src/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { envs } from '../config/envs';
import { logger } from '../config/logger';

import { AppError } from '../helpers/error.helper';
import { errorResponse } from '../helpers/response.helper';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error('🔥 [Error Middleware]:', err.message);

    if (err instanceof AppError) {
        return errorResponse(res, err.statusCode, err.message);
    }

    // Manejo de Multer
    if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(
                res,
                413,
                'El archivo es demasiado grande. El límite estricto es de 10MB.',
            );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return errorResponse(res, 400, 'Solo se permite subir un archivo a la vez.');
        }
        return errorResponse(res, 400, `Error de carga: ${err.message}`);
    }

    if (err.message.includes('Formato de archivo no soportado')) {
        return errorResponse(res, 415, err.message);
    }

    // Errores internos no controlados
    const isProduction = envs.NODE_ENV === 'production';
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const finalMessage = isProduction ? 'Error interno en el servidor de multimedia.' : err.message;

    return errorResponse(res, statusCode, finalMessage);
};
