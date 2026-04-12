import { z } from 'zod';
import { RutHelper } from '../helpers/rut.helper';

export const rutSchema = z
    .string()
    .min(8, 'RUT demasiado corto')
    .max(12, 'RUT demasiado largo')
    .refine(RutHelper.validate, { message: 'RUT inválido (Dígito verificador incorrecto)' });

export const paginationSchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => Math.max(1, Number(val) || 1)),
    limit: z
        .string()
        .optional()
        .transform((val) => Math.min(100, Number(val) || 10)),
});
