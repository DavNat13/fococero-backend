import { z } from 'zod';
import { OrganismoType, PrioridadType } from '../models/despacho.model';

export const createDespachoSchema = z.object({
    body: z.object({
        alerta_id: z.string().uuid('alerta_id inválido'),
        correlation_id: z.string().uuid('correlation_id inválido'),
        organismo: z.nativeEnum(OrganismoType, {
            errorMap: () => ({ message: 'Organismo no soportado' }),
        }),
        prioridad: z.nativeEnum(PrioridadType).default(PrioridadType.MEDIA),
        endpoint_url: z.string().url('URL de endpoint inválida'),
        request_payload: z.record(z.unknown()).refine((obj) => Object.keys(obj).length > 0, {
            message: 'El payload no puede estar vacío',
        }),
    }),
});

export const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de despacho inválido'),
    }),
    body: z.object({
        estado: z.string(), // La lógica de transición de estados irá en el Service
    }),
});

export type CreateDespachoInput = z.infer<typeof createDespachoSchema>['body'];
