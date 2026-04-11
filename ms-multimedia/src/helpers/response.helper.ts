// ms-multimedia/src/helpers/response.helper.ts

import { Response } from 'express';

/**
 * Helper para estandarizar las respuestas exitosas de la API.
 * Usamos el Genérico <T> para evitar el uso de 'any' manteniendo la flexibilidad.
 */
export const successResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        // Solo incluye la propiedad 'data' si fue proporcionada (no es undefined)
        ...(data !== undefined && { data }),
    });
};

/**
 * Helper para estandarizar las respuestas de error.
 */
export const errorResponse = <T>(
    res: Response,
    statusCode: number,
    errorMsg: string,
    detalles?: T,
) => {
    return res.status(statusCode).json({
        success: false,
        error: errorMsg,
        ...(detalles !== undefined && { detalles }),
    });
};
