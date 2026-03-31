// src/models/geo.model.ts

/**
 * Estados oficiales operativos de la emergencia en FocoCero.
 */
export enum EstadoFoco {
    REPORTADO = 'Reportado',
    EN_EVALUACION = 'En Evaluación',
    EN_COMBATE = 'En Combate',
    CONTROLADO = 'Controlado',
    EXTINGUIDO = 'Extinguido',
    FALSA_ALARMA = 'Falsa Alarma'
}

/**
 * Niveles de severidad estandarizados por el motor lógico (GeoHelper).
 */
export enum SeveridadFoco {
    BAJA = 'Baja',
    MODERADA = 'Moderada',
    ALTA = 'Alta',
    CRITICA = 'Crítica'
}

// ============================================================================
// 📥 DTO (Data Transfer Object) - Lo que entra al sistema (Ciudadano)
// ============================================================================

/**
 * Payload esperado cuando se reporta un nuevo foco.
 * Solo contiene datos crudos antes de ser procesados por PostGIS.
 */
export interface CrearFocoDTO {
    latitud: number;
    longitud: number;
    detalles?: string;
    tipo_incidente?: string;
    viento_velocidad_kmh?: number;
    viento_direccion?: string;
    amenaza_viviendas?: boolean;
}

// ============================================================================
// 🗄️ ENTIDAD - Lo que vive en la Base de Datos (PostGIS)
// ============================================================================

/**
 * Representación estricta de la tabla de PostgreSQL en TypeScript.
 */
export interface UbicacionFoco {
    id: string; // Obligatorio (UUID)
    reporte_id?: string;
    tipo_incidente: string;
    severidad: SeveridadFoco;
    estado: EstadoFoco;
    detalles?: string;
    
    // Variables Climáticas y de Riesgo
    radio_afectacion_metros: number;
    direccion_referencial?: string;
    es_verificado: boolean;
    viento_velocidad_kmh: number;
    viento_direccion?: string;
    amenaza_viviendas: boolean;
    
    // 🗺️ Variables Espaciales (Magia PostGIS)
    // Cuando consultemos la BD, pediremos que formatee el POINT a GeoJSON o WKT
    geom_geojson?: string; 
    area_quemada_wkt?: string; 
    
    // Trazabilidad
    creado_en: Date;
    actualizado_en: Date;
}