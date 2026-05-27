// src/services/alerta.service.ts
import axios from 'axios';
import { AlertaRepository } from '../repositories/alerta.repository';
import { IAlerta, EstadoAlerta } from '../models/alerta.model';
import { AppError } from '../helpers/appError';
import { envs } from '../config/envs';
import { logger } from '../config/logger';

export class AlertaService {
    // 🟢 CREACIÓN
    /**
     * Crea una alerta táctica y vincula la multimedia asociada si el brigadista adjuntó una foto.
     * @param data Datos espaciales y de la alerta
     * @param id_multimedia ID opcional de la imagen subida al ms-multimedia
     */
    static async crearAlerta(data: IAlerta, id_multimedia?: string): Promise<IAlerta> {
        if (
            !data.ubicacion ||
            !data.ubicacion.coordinates ||
            data.ubicacion.coordinates.length !== 2
        ) {
            throw new AppError('Las coordenadas [longitud, latitud] son obligatorias.', 400);
        }

        // 1. Guardamos la alerta en la base de datos local
        const nuevaAlerta = await AlertaRepository.crear(data);

        // 2. Si hay evidencia fotográfica, notificamos al ms-multimedia para que la adopte
        if (id_multimedia && nuevaAlerta.id) {
            // Fire and forget: asíncrono para no bloquear la respuesta rápida de la alerta
            this.vincularMultimedia(id_multimedia, data.usuario_id, nuevaAlerta.id);
        }

        return nuevaAlerta;
    }

    /**
     * Comunicación interna (Inter-Service): Llama al ms-multimedia para vincular la foto.
     */
    private static async vincularMultimedia(
        id_multimedia: string,
        userId: string,
        alertaId: string,
    ) {
        try {
            const url = `${envs.MULTIMEDIA_SERVICE_URL}/api/v1/multimedia/${id_multimedia}/vincular`;

            await axios.patch(
                url,
                {},
                {
                    headers: {
                        'x-user-id': userId,
                        'x-internal-call': 'ms-alertas',
                    },
                },
            );

            logger.info(
                `✅ Imagen ${id_multimedia} vinculada exitosamente a la alerta ${alertaId}`,
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`⚠️ Error vinculando multimedia ${id_multimedia}: ${errorMessage}`);
        }
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
