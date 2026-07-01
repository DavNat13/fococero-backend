import { Usuario } from './user.model';

export interface PerfilBrigadista {
    id?: number;
    usuario_id: number;
    organismo: string;
    rango: string;
    zona_asignada: string;
    numero_placa: string;
    fecha_ingreso?: Date | string;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface Certificacion {
    id?: number;
    brigadista_id: number;
    tipo: string;
    organismo_emisor: string;
    fecha_obtencion: Date | string;
    fecha_vencimiento?: Date | string;
    archivo_url?: string;
    created_at?: Date | string;
}

/** Response shape: user + profile joined */
export interface UsuarioWithPerfil extends Usuario {
    perfil_brigadista?: PerfilBrigadista | null;
}
