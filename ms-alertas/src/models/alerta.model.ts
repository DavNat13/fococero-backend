export enum NivelAlerta {
    INFORMATIVA = 'INFORMATIVA',
    PREVENTIVA = 'PREVENTIVA',
    EVACUACION = 'EVACUACION',
    CRITICA = 'CRITICA'
}

export interface Alerta {
    id?: number;
    titulo: string;
    mensaje: string;
    nivel: NivelAlerta;
    latitud: number;
    longitud: number;
    sector: string;
    autor_id: number; // Referencia al ID del funcionario en ms-auth
    creado_en?: Date;
}