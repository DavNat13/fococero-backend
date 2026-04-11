// ms-multimedia/src/validators/multimedia.validator.ts

import { z } from 'zod';
import { ContextoMultimedia } from '../models/archivo.model';

/**
 * Validador para el endpoint de subida de archivos (POST /upload)
 */
export const uploadValidator = z.object({
    body: z.object({
        // Si el cliente envía un contexto, debe ser uno de los válidos.
        // Si no lo envía, Zod inyectará 'reporte' por defecto. 
        contexto: z
            .nativeEnum(ContextoMultimedia, {
                errorMap: () => ({ message: 'El contexto proporcionado no es válido.' }),
            })
            .optional()
            .default(ContextoMultimedia.REPORTE),
    }),
});

/**
 * Validador para endpoints que reciben un ID por parámetro de la URL (PATCH, DELETE)
 */
export const idParamValidator = z.object({
    params: z.object({
        id: z.string().uuid({
            message: 'El ID proporcionado no tiene un formato UUID válido.',
        }),
    }),
});
