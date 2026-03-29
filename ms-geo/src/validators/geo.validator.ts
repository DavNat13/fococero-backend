// src/validators/geo.validator.ts

import { CrearFocoDTO, EstadoFoco } from '../models/geo.model';

/**
 * GeoValidator: El Escudo Perimetral Lógico.
 * Se asegura de que la basura informática nunca llegue a la base de datos PostGIS.
 */
export class GeoValidator {
    
    // ============================================================================
    // 🟢 VALIDACIÓN DE ENTRADA CIUDADANA (CREACIÓN)
    // ============================================================================

    /**
     * Valida que el reporte inicial tenga coordenadas válidas dentro del territorio nacional.
     */
    static validarCreacion(data: any): { isValid: boolean; error?: string } {
        if (typeof data.latitud !== 'number' || typeof data.longitud !== 'number') {
            return { isValid: false, error: 'Latitud y longitud son obligatorias y deben ser numéricas.' };
        }

        const lat = data.latitud;
        const lng = data.longitud;

        // 🗺️ Geofencing: Límites aproximados de Chile Continental
        // Latitud: Desde el norte de Arica (-17.0) hasta el sur de Punta Arenas (-56.0)
        // Longitud: Cordillera (-66.0) al Océano (-76.0)
        if (lat > -17 || lat < -56 || lng > -66 || lng < -76) {
            return { 
                isValid: false, 
                error: 'Coordenadas rechazadas: El punto de origen reportado está fuera de la jurisdicción territorial de Chile.' 
            };
        }

        // Validaciones secundarias de tipos
        if (data.viento_velocidad_kmh && typeof data.viento_velocidad_kmh !== 'number') {
            return { isValid: false, error: 'La velocidad del viento debe ser un valor numérico.' };
        }

        return { isValid: true };
    }

    // ============================================================================
    // 🟠 VALIDACIÓN OPERATIVA (ESTADOS)
    // ============================================================================

    /**
     * Valida que un cambio de estado pertenezca al protocolo oficial.
     */
    static validarEstado(estado: any): { isValid: boolean; error?: string } {
        if (!estado || typeof estado !== 'string') {
            return { isValid: false, error: 'El estado es requerido.' };
        }

        const esValido = Object.values(EstadoFoco).includes(estado as EstadoFoco);
        
        if (!esValido) {
            return { 
                isValid: false, 
                error: `Estado operacional no reconocido. Valores permitidos: ${Object.values(EstadoFoco).join(', ')}` 
            };
        }

        return { isValid: true };
    }

    // ============================================================================
    // 🔵 VALIDACIÓN ESPACIAL PRO (POLÍGONOS)
    // ============================================================================

    /**
     * Valida que la sintaxis WKT (Well-Known Text) sea segura antes de enviarla a PostGIS.
     */
    static validarPerimetroWKT(wkt: any): { isValid: boolean; error?: string } {
        if (!wkt || typeof wkt !== 'string') {
            return { isValid: false, error: 'El perímetro (área quemada) debe ser un texto en formato WKT.' };
        }

        const wktUpper = wkt.toUpperCase().trim();
        
        // PostGIS exige que el polígono esté cerrado y sea un tipo geométrico válido
        if (!wktUpper.startsWith('POLYGON') && !wktUpper.startsWith('MULTIPOLYGON')) {
            return { 
                isValid: false, 
                error: 'Formato geométrico inválido. FocoCero solo admite polígonos (POLYGON o MULTIPOLYGON) para mapear el área quemada.' 
            };
        }

        return { isValid: true };
    }
}