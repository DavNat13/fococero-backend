// src/validators/geo.validator.ts
import { z } from 'zod';
import { EstadoFoco } from '../models/geo.model';

const CHILE_BOUNDS = {
    lat: { min: -56.0, max: -17.0 },
    lng: { min: -76.0, max: -66.0 },
};

/**
 * GeoValidator: Escudo de validación basado en Zod.
 */
export const crearFocoSchema = z.object({
    body: z
        .object({
            tipo_incidente: z.string().min(3, 'El tipo de incidente es demasiado corto.'),
            latitud: z
                .number()
                .min(CHILE_BOUNDS.lat.min, 'Latitud fuera de territorio chileno.')
                .max(CHILE_BOUNDS.lat.max, 'Latitud fuera de territorio chileno.'),
            longitud: z
                .number()
                .min(CHILE_BOUNDS.lng.min, 'Longitud fuera de territorio chileno.')
                .max(CHILE_BOUNDS.lng.max, 'Longitud fuera de territorio chileno.'),
            detalles: z.string().max(500).optional(),
            viento_velocidad_kmh: z.number().nonnegative().optional().default(0),
            viento_direccion: z.string().optional(),
            amenaza_viviendas: z.boolean().optional().default(false),
            radio_afectacion_metros: z.number().positive().optional().default(50),
            reporte_id: z.string().optional(),
        })
        .strict(),
});

/**
 * Esquema para actualización integral (PUT)
 */
export const actualizarFocoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido.'),
    }),
    body: z
        .object({
            tipo_incidente: z.string().min(3).optional(),
            detalles: z.string().max(500).optional(),
            viento_velocidad_kmh: z.number().nonnegative().optional(),
            amenaza_viviendas: z.boolean().optional(),
            viento_direccion: z.string().optional(),
        })
        .strict(),
});

export const cambiarEstadoSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de foco inválido.'),
    }),
    body: z
        .object({
            estado: z.nativeEnum(EstadoFoco, {
                message: 'Estado operativo no reconocido.',
            }),
        })
        .strict(),
});

export const actualizarPerimetroSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z
        .object({
            area_quemada_wkt: z.string().refine((wkt) => {
                const upper = wkt.toUpperCase().trim();
                return upper.startsWith('POLYGON') || upper.startsWith('MULTIPOLYGON');
            }, 'Se requiere formato WKT (POLYGON/MULTIPOLYGON).'),
        })
        .strict(),
});

export const queryCercanosSchema = z.object({
    query: z.object({
        lat: z.string().transform((val) => parseFloat(val)),
        lng: z.string().transform((val) => parseFloat(val)),
        radio: z.string().transform((val) => parseInt(val, 10)),
    }),
});
