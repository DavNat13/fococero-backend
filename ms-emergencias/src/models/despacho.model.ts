export enum OrganismoType {
    BOMBEROS = 'BOMBEROS',
    CONAF = 'CONAF',
    SAMU = 'SAMU',
    CARABINEROS = 'CARABINEROS',
    PDI = 'PDI',
    SENAPRED = 'SENAPRED',
    MUNICIPALIDAD = 'MUNICIPALIDAD',
    DELEGACION = 'DELEGACION',
    EJERCITO = 'EJERCITO',
    ARMADA = 'ARMADA',
    SERVICIOS_PUBLICOS = 'SERVICIOS_PUBLICOS',
}

export enum DespachoStatus {
    PENDIENTE = 'PENDIENTE',
    PROCESANDO = 'PROCESANDO',
    EXITOSO = 'EXITOSO',
    FALLIDO = 'FALLIDO',
    REINTENTANDO = 'REINTENTANDO',
    CANCELADO = 'CANCELADO',
}

export enum PrioridadType {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA',
}

export interface IDespacho {
    id: string;
    alerta_id: string;
    correlation_id: string;
    organismo: OrganismoType;
    estado: DespachoStatus;
    prioridad: PrioridadType;
    request_payload: Record<string, unknown>;
    response_payload: Record<string, unknown> | null;
    endpoint_url: string;
    intentos_actuales: number;
    max_reintentos_permitidos: number;
    duracion_ms: number | null;
    codigo_error_http: number | null;
    error_detalle: string | null;
    created_at: Date;
    updated_at: Date;
    finalizado_at: Date | null;
}

export interface ICreateDespachoDTO {
    alerta_id: string;
    correlation_id: string;
    organismo: OrganismoType;
    prioridad: PrioridadType;
    request_payload: Record<string, unknown>;
    endpoint_url: string;
}

export interface IFinishDespachoDTO {
    estado: DespachoStatus.EXITOSO | DespachoStatus.FALLIDO | DespachoStatus.CANCELADO;
    response_payload?: Record<string, unknown>;
    duracion_ms: number;
    codigo_error_http?: number;
    error_detalle?: string;
}
