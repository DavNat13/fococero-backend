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

// 🛡️ Sincronizado exactamente con el TYPE estado_alerta de Postgres
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
    metadata?: any;

    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    eliminado_en?: Date | null;
}
