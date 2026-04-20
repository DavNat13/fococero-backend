// ms-reportes/src/validators/reporte.validator.ts

import { z } from 'zod';
import { EstadoReporte } from '../models/reporte.model';

// 1. Validador base reutilizable para parámetros de URL
const idParamSchema = z.object({
    id: z.string().uuid({ message: 'El ID del reporte debe ser un UUID válido.' }),
});

// 2. Validador base reutilizable para metadata (Cero 'any', usamos 'unknown' estructurado)
const metadataSchema = z.record(z.string(), z.unknown()).optional();

// ============================================================================
// 🟢 VALIDACIÓN DE CREACIÓN (POST /)
// ============================================================================
export const crearReporteSchema = z.object({
    body: z
        .object({
            categoria_id: z.string().uuid({ message: 'Formato de categoría inválido.' }),
            titulo: z
                .string()
                .min(5, 'El título es muy corto.')
                .max(150, 'El título es muy largo.'),
            descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
            latitud: z.number().min(-90).max(90, 'Latitud fuera del rango global.'),
            longitud: z.number().min(-180).max(180, 'Longitud fuera del rango global.'),
            metadata: metadataSchema,
        })
        .strict(), // 🛡️ CRÍTICO: Rechaza cualquier campo extra que no esté definido arriba
});

// ============================================================================
// 🟡 VALIDACIÓN DE ACTUALIZACIÓN PARCIAL (PATCH /:id)
// ============================================================================
export const actualizarReporteSchema = z.object({
    params: idParamSchema,
    body: z
        .object({
            titulo: z.string().min(5).max(150).optional(),
            descripcion: z.string().min(10).optional(),
            metadata: metadataSchema,
        })
        .strict()
        .refine((data) => Object.keys(data).length > 0, {
            message:
                'Debe enviar al menos un campo válido para actualizar (titulo, descripcion o metadata).',
        }),
});

// ============================================================================
// 🟠 VALIDACIÓN OPERATIVA DE ESTADOS (PATCH /:id/estado)
// ============================================================================
export const cambiarEstadoSchema = z.object({
    params: idParamSchema,
    body: z
        .object({
            nuevoEstado: z.nativeEnum(EstadoReporte, {
                message: 'Estado inválido. Use: PENDIENTE, EN_PROCESO, RESUELTO o FALSA_ALARMA',
            }),
            comentarios: z
                .string()
                .max(500, 'El comentario excede los 500 caracteres permitidos.')
                .optional(),
        })
        .strict(),
});

// ============================================================================
// 🔴 VALIDACIÓN DE ELIMINACIÓN (DELETE /:id)
// ============================================================================
export const eliminarReporteSchema = z.object({
    params: idParamSchema,
});
