import { z } from 'zod';
import { OrganismoType, PrioridadType, DespachoStatus } from '../models/despacho.model';

const VALID_TRANSITIONS: Record<DespachoStatus, DespachoStatus[]> = {
    [DespachoStatus.PENDIENTE]: [DespachoStatus.PROCESANDO, DespachoStatus.CANCELADO],
    [DespachoStatus.PROCESANDO]: [DespachoStatus.EXITOSO, DespachoStatus.FALLIDO, DespachoStatus.CANCELADO],
    [DespachoStatus.EXITOSO]: [],
    [DespachoStatus.FALLIDO]: [DespachoStatus.REINTENTANDO, DespachoStatus.CANCELADO],
    [DespachoStatus.REINTENTANDO]: [DespachoStatus.PROCESANDO, DespachoStatus.CANCELADO],
    [DespachoStatus.CANCELADO]: [],
};

const urlAllowlistPattern = /^https:\/\/(api\.)?(bomberos|conaf|carabineros|senapred)\.cl\//;

export const createDespachoSchema = z.object({
    body: z.object({
        alerta_id: z.string().uuid('alerta_id inválido'),
        correlation_id: z.string().uuid('correlation_id inválido'),
        organismo: z.nativeEnum(OrganismoType, {
            errorMap: () => ({ message: 'Organismo no soportado' }),
        }),
        prioridad: z.nativeEnum(PrioridadType).default(PrioridadType.MEDIA),
        endpoint_url: z
            .string()
            .url('URL de endpoint inválida')
            .refine((url) => urlAllowlistPattern.test(url), {
                message: 'URL de endpoint no está en la lista de dominios permitidos',
            }),
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
        estado: z.nativeEnum(DespachoStatus, {
            errorMap: () => ({ message: 'Estado de despacho no válido' }),
        }),
    }),
});

export function isValidTransition(
    currentStatus: DespachoStatus,
    nextStatus: DespachoStatus,
): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(nextStatus) : false;
}

export type CreateDespachoInput = z.infer<typeof createDespachoSchema>['body'];
