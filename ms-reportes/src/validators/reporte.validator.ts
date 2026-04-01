// src/validators/reporte.validator.ts

import { z } from 'zod';
import { EstadoReporte } from '../models/reporte.model';

/**
 * ReporteValidator: El Escudo Perimetral de Datos.
 * Impide que payloads maliciosos o mal formateados lleguen al Controlador.
 */

// ============================================================================
// 🟢 VALIDACIÓN DE CREACIÓN (Ciudadano)
// ============================================================================
export const crearReporteSchema = z.object({
    body: z.object({
        categoria_id: z.string().uuid({ message: 'Formato de categoría inválido.' }),
        titulo: z.string().min(5, 'El título es muy corto.').max(150, 'El título es muy largo.'),
        descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
        // Validación geográfica estricta (Límites lógicos mundiales)
        latitud: z.number().min(-90).max(90, 'Latitud fuera del rango global.'),
        longitud: z.number().min(-180).max(180, 'Longitud fuera del rango global.'),
        // 🛠️ FIX 1: Explicitamos que las llaves son strings y los valores son 'any'
        metadata: z.record(z.string(), z.any()).optional() 
    }).strict() // 🛡️ CRÍTICO: Rechaza cualquier campo extra que no esté definido arriba
});

// ============================================================================
// 🟠 VALIDACIÓN OPERATIVA (Brigadista/Admin)
// ============================================================================
export const cambiarEstadoSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'El ID del reporte debe ser un UUID válido.' })
    }),
    body: z.object({
        // 🛠️ FIX DEFINITIVO: Usamos directamente 'message' como lo exige tu versión de Zod
        nuevoEstado: z.nativeEnum(EstadoReporte, {
            message: 'Estado inválido. Use: PENDIENTE, EN_PROCESO, RESUELTO o FALSA_ALARMA'
        }),
        comentarios: z.string().max(500, 'El comentario excede los 500 caracteres permitidos.').optional()
    }).strict() // 🛡️ CRÍTICO: Evita inyección de datos
});