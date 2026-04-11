// src/models/reporte.model.ts

export enum EstadoReporte {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN_PROCESO',
    RESUELTO = 'RESUELTO',
    FALSA_ALARMA = 'FALSA_ALARMA',
}

export interface IGeoPoint {
    type: 'Point';
    coordinates: [number, number];
}

export interface IReporteMetadata {
    clima_momento?: string;
    temperatura?: number;
    es_anonimo?: boolean;
    fotos_urls?: string[];
    [key: string]: unknown;
}

export interface ICategoriaIncidente {
    id: string;
    nombre: string;
    descripcion: string | null;
    nivel_prioridad: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface IReporte {
    id: string;
    categoria_id: string;
    titulo: string;
    descripcion: string;
    latitud: number;
    longitud: number;
    ubicacion?: IGeoPoint;
    estado: EstadoReporte;
    id_ciudadano: string;
    metadata: IReporteMetadata;
    created_at: Date;
    updated_at: Date;
}

export interface IHistorialEstado {
    id: string;
    reporte_id: string;
    estado_anterior: EstadoReporte | null;
    estado_nuevo: EstadoReporte;
    id_usuario_modificador: string;
    comentarios: string | null;
    created_at: Date;
}

// --- DTOs (Data Transfer Objects) ---

export interface ICreateReporteDTO extends Omit<
    IReporte,
    'id' | 'estado' | 'ubicacion' | 'created_at' | 'updated_at' | 'metadata'
> {
    metadata?: IReporteMetadata;
}

export type ICreateHistorialDTO = Omit<IHistorialEstado, 'id' | 'created_at'>;

// DTO para actualización parcial por el ciudadano
export interface IUpdateReporteDTO {
    titulo?: string;
    descripcion?: string;
    metadata?: IReporteMetadata;
}
