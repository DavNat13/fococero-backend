// ms-multimedia/src/models/archivo.model.ts

export enum ContextoMultimedia {
    REPORTE = 'reporte',
    ALERTA = 'alerta',
    PERFIL_CIUDADANO = 'perfil_ciudadano',
    EVIDENCIA_BRIGADA = 'evidencia_brigada',
}

export interface IArchivoMultimedia {
    id: string;
    url_publica: string;
    formato: string;
    peso_bytes: number; // En JS los números aguantan hasta 9 Petabytes de forma segura (53 bits)
    id_usuario: string;
    contexto: ContextoMultimedia;
    metadata: Record<string, unknown>; // JSONB flexible para EXIF, width, height, etc.
    es_huerfano: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

// DTO para registrar un archivo recién subido a Firebase

export interface ICreateArchivoDTO extends Omit<
    IArchivoMultimedia,
    'id' | 'es_huerfano' | 'created_at' | 'updated_at' | 'deleted_at' | 'metadata'
> {
    metadata?: Record<string, unknown>;
}

// DTO para actualizaciones (ej. vincularlo a un reporte o actualizar metadata)
export interface IUpdateArchivoDTO {
    es_huerfano?: boolean;
    metadata?: Record<string, unknown>;
}