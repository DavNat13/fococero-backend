/**
 * ============================================================================
 * ENUMS
 * ============================================================================
 */
export enum EstadoReporte {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN_PROCESO',
    RESUELTO = 'RESUELTO',
    FALSA_ALARMA = 'FALSA_ALARMA'
}

/**
 * ============================================================================
 * TIPOS UTILITARIOS (PostGIS y JSONB)
 * ============================================================================
 */
// Interfaz estándar de GeoJSON (Así es como PostGIS devuelve la columna GEOGRAPHY)
export interface IGeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitud, latitud]
}

// Estructura sugerida para nuestra columna JSONB (Metadatos flexibles)
export interface IReporteMetadata {
    clima_momento?: string;
    temperatura?: number;
    es_anonimo?: boolean;
    fotos_urls?: string[];
    [key: string]: any; // Permite inyectar más propiedades dinámicas sin romper el tipado
}

/**
 * ============================================================================
 * INTERFACES PRINCIPALES (Lectura - Espejo exacto de PostgreSQL)
 * ============================================================================
 */
export interface ICategoriaIncidente {
    id: string; // UUID
    nombre: string;
    descripcion: string | null;
    nivel_prioridad: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface IReporte {
    id: string; // UUID
    categoria_id: string; // UUID
    titulo: string;
    descripcion: string;
    latitud: number;
    longitud: number;
    ubicacion?: IGeoPoint; // Resultado de ST_AsGeoJSON(ubicacion) en SQL
    estado: EstadoReporte;
    id_ciudadano: string; // VARCHAR(128)
    metadata: IReporteMetadata; // JSONB fuertemente tipado
    created_at: Date;
    updated_at: Date;
}

export interface IHistorialEstado {
    id: string; // UUID
    reporte_id: string; // UUID
    estado_anterior: EstadoReporte | null;
    estado_nuevo: EstadoReporte;
    id_usuario_modificador: string; // VARCHAR(128)
    comentarios: string | null;
    created_at: Date;
}

/**
 * ============================================================================
 * DTOs (Data Transfer Objects para Creación y Actualización)
 * ============================================================================
 * Uso de Omit<>: Heredamos la interfaz base pero le quitamos los campos 
 * que el Frontend no debe enviar (porque los autogenera la BD).
 */

// Para crear, quitamos ID, fechas, estado, ubicacion y la metadata original para poder redefinirla
export interface ICreateReporteDTO extends Omit<IReporte, 'id' | 'estado' | 'ubicacion' | 'created_at' | 'updated_at' | 'metadata'> {
    metadata?: IReporteMetadata; // Ahora sí podemos declararla como opcional sin que TypeScript se enoje
}

// Para el historial, omitimos el ID y la fecha de creación que las pone PostgreSQL
export interface ICreateHistorialDTO extends Omit<IHistorialEstado, 'id' | 'created_at'> {}