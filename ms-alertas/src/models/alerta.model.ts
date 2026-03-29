// ==========================================
// 🚨 MODELO DE DATOS: MS-ALERTAS
// ==========================================

export enum TipoAlerta {
    INCENDIO = 'INCENDIO',
    MICROBASURAL = 'MICROBASURAL',
    VEGETACION_SECA = 'VEGETACION_SECA',
    ALUMBRADO_DEFECTUOSO = 'ALUMBRADO_DEFECTUOSO',
    OTRO = 'OTRO',
}

export enum GravedadAlerta {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA',
}

export enum EstadoAlerta {
    REPORTADA = 'REPORTADA',
    EN_REVISION = 'EN_REVISION',
    DERIVADA = 'DERIVADA',
    RESUELTA = 'RESUELTA',
    DESCARTADA = 'DESCARTADA',
}

export interface IPoint {
    type: 'Point';
    coordinates: [number, number];
}

export interface IAlerta {
    id?: string;
    foco_id?: string | null;
    usuario_id: string;

    tipo: TipoAlerta;
    gravedad?: GravedadAlerta;
    estado?: EstadoAlerta;

    descripcion: string;
    imagenes?: string[];

    ubicacion: IPoint;
    metadata?: Record<string, any>;

    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    eliminado_en?: Date | null;
}

export interface IHistorialAlerta {
    id?: string;
    alerta_id: string;
    estado_anterior?: EstadoAlerta | null;
    estado_nuevo: EstadoAlerta;
    usuario_modificador_id?: string | null;
    comentario?: string | null;
    fecha_cambio?: Date;
}
