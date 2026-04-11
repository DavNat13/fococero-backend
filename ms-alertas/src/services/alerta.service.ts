// src/services/alerta.service.ts
import { AlertaRepository } from '../repositories/alerta.repository';
import { IAlerta, EstadoAlerta } from '../models/alerta.model';
import { AppError } from '../helpers/appError';

export class AlertaService {
    // 🟢 CREACIÓN
    static async crearAlerta(data: IAlerta): Promise<IAlerta> {
        if (
            !data.ubicacion ||
            !data.ubicacion.coordinates ||
            data.ubicacion.coordinates.length !== 2
        ) {
            throw new AppError('Las coordenadas [longitud, latitud] son obligatorias.', 400);
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
            throw new AppError(
                'El radio de búsqueda no puede superar los 50.000 metros por rendimiento.',
                400,
            );
        }
        return await AlertaRepository.encontrarCercanas(lng, lat, radioMetros);
    }

    // ✅ FIX: Métodos de lectura agregados
    static async obtenerPorUsuario(usuario_id: string): Promise<IAlerta[]> {
        return await AlertaRepository.obtenerPorUsuario(usuario_id);
    }

    static async obtenerPorId(id: string): Promise<IAlerta> {
        const alerta = await AlertaRepository.obtenerPorId(id);
        if (!alerta) {
            throw new AppError('La alerta solicitada no existe o fue eliminada.', 404);
        }
        return alerta;
    }

    static async obtenerTodas(): Promise<IAlerta[]> {
        return await AlertaRepository.obtenerTodas();
    }

    // 🟠 ACTUALIZACIÓN OPERATIVA
    static async cambiarEstado(id: string, nuevoEstado: EstadoAlerta): Promise<IAlerta> {
        const actualizada = await AlertaRepository.actualizarEstado(id, nuevoEstado);
        if (!actualizada) {
            throw new AppError('Alerta no encontrada o ya fue descartada.', 404);
        }
        return actualizada;
    }

    static async verificarAlerta(id: string, esFuegoConfirmado: boolean): Promise<IAlerta> {
        const nuevoEstado = esFuegoConfirmado ? EstadoAlerta.DERIVADA : EstadoAlerta.DESCARTADA;
        return await this.cambiarEstado(id, nuevoEstado);
    }

    // 🔴 ELIMINACIÓN LÓGICA (SOFT DELETE)
    static async eliminar(id: string): Promise<void> {
        const fueEliminado = await AlertaRepository.eliminar(id);
        if (!fueEliminado) {
            throw new AppError('No se pudo eliminar la alerta. Verifique que exista.', 404);
        }
    }
}
