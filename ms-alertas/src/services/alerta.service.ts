// ==========================================
// 🧠 SERVICIO: MS-ALERTAS
// ==========================================

import { AlertaRepository } from '../repositories/alerta.repository';
import { IAlerta, EstadoAlerta } from '../models/alerta.model';

export class AlertaService {
    // 🟢 CREACIÓN
    static async crearAlerta(data: IAlerta): Promise<IAlerta> {
        if (
            !data.ubicacion ||
            !data.ubicacion.coordinates ||
            data.ubicacion.coordinates.length !== 2
        ) {
            const error = new Error('Las coordenadas [longitud, latitud] son obligatorias.');
            (error as any).statusCode = 400;
            throw error;
        }
        return await AlertaRepository.crear(data);
    }

    // 🔵 LECTURA ESPACIAL Y CONSULTAS
    static async obtenerCercanas(
        lng: number,
        lat: number,
        radioMetros: number = 5000,
    ): Promise<IAlerta[]> {
        if (radioMetros > 50000) {
            const error = new Error(
                'El radio de búsqueda no puede superar los 50.000 metros por rendimiento.',
            );
            (error as any).statusCode = 400;
            throw error;
        }
        return await AlertaRepository.encontrarCercanas(lng, lat, radioMetros);
    }

    static async obtenerPorUsuario(usuarioId: string): Promise<IAlerta[]> {
        return await AlertaRepository.obtenerPorUsuario(usuarioId);
    }

    static async obtenerTodas(): Promise<IAlerta[]> {
        return await AlertaRepository.obtenerTodas();
    }

    static async obtenerPorId(id: string): Promise<IAlerta> {
        const alerta = await AlertaRepository.obtenerPorId(id);
        if (!alerta) {
            const error = new Error('Alerta no encontrada en el sistema.');
            (error as any).statusCode = 404;
            throw error;
        }
        return alerta;
    }

    // 🟠 ACTUALIZACIÓN OPERATIVA
    static async cambiarEstado(id: string, nuevoEstado: EstadoAlerta): Promise<IAlerta> {
        const actualizada = await AlertaRepository.actualizarEstado(id, nuevoEstado);

        if (!actualizada) {
            const error = new Error('Alerta no encontrada o ya fue descartada.');
            (error as any).statusCode = 404;
            throw error;
        }
        return actualizada;
    }

    static async verificarAlerta(id: string, esFuegoConfirmado: boolean): Promise<IAlerta> {
        // 🛡️ Usamos los estados exactos definidos en la base de datos
        const nuevoEstado = esFuegoConfirmado
            ? EstadoAlerta.DERIVADA // Si se confirma el fuego, se deriva (o EN_REVISION)
            : EstadoAlerta.DESCARTADA; // Si es falsa alarma, se descarta

        const actualizada = await this.cambiarEstado(id, nuevoEstado);
        return actualizada;
    }

    // 🔴 ELIMINACIÓN LÓGICA (SOFT DELETE)
    static async eliminar(id: string): Promise<void> {
        const fueEliminado = await AlertaRepository.eliminar(id);

        if (!fueEliminado) {
            const error = new Error(
                'No se pudo eliminar la alerta (no existe o ya fue eliminada previamente).',
            );
            (error as any).statusCode = 404;
            throw error;
        }
    }
}
