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
    FALSA_ALARMA = 'Falsa Alarma',
}

/**
 * Niveles de severidad estandarizados por el motor lógico.
 */
export enum SeveridadFoco {
    BAJA = 'Baja',
    MODERADA = 'Moderada',
    ALTA = 'Alta',
    CRITICA = 'Crítica',
}

// ============================================================================
// 📥 DTOs (Data Transfer Objects)
// ============================================================================

export interface ICrearFocoDTO {
    reporte_id?: string;
    tipo_incidente: string;
    latitud: number;
    longitud: number;
    detalles?: string;
    viento_velocidad_kmh?: number;
    viento_direccion?: string;
    amenaza_viviendas?: boolean;
    radio_afectacion_metros?: number;
}

export interface IUpdateFocoDTO {
    tipo_incidente?: string;
    detalles?: string;
    viento_velocidad_kmh?: number;
    amenaza_viviendas?: boolean;
    estado?: EstadoFoco;
}

// ============================================================================
// 🗄️ ENTIDAD - Representación de la Base de Datos
// ============================================================================

export interface IUbicacionFoco {
    id: string;
    reporte_id: string;
    tipo_incidente: string;
    severidad: SeveridadFoco;
    estado: EstadoFoco;
    detalles?: string;
    radio_afectacion_metros: number;
    es_verificado: boolean;
    viento_velocidad_kmh: number;
    viento_direccion?: string;
    amenaza_viviendas: boolean;

    // 🗺️ Variables Espaciales formatatadas desde PostGIS
    latitud: number;
    longitud: number;
    perimetro_wkt?: string; // Formato WKT para polígonos

    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
