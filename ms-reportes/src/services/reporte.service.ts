// ms-reportes/src/services/reporte.service.ts

import axios from 'axios';
import { ReporteRepository } from '../repositories/reporte.repository';
import { ICreateReporteDTO, IUpdateReporteDTO, EstadoReporte } from '../models/reporte.model';
import { UserRole } from '../models/user.enum';
import { AppError } from '../helpers/appError';
import { envs } from '../config/envs';
import { logger } from '../config/logger';

const ESTADOS_FINALES = new Set<EstadoReporte>([
    EstadoReporte.RESUELTO,
    EstadoReporte.FALSA_ALARMA,
]);

export class ReporteService {
    // --- CATEGORÍAS ---
    static async obtenerCategorias() {
        return await ReporteRepository.obtenerCategorias();
    }

    // --- REPORTES ---

    /**
     * Crea un reporte y vincula la multimedia asociada si existe.
     * @param data Datos del reporte
     * @param id_multimedia ID opcional de la imagen previamente subida
     */
    static async crearReporte(data: ICreateReporteDTO, id_multimedia?: string) {
        // 1. Persistimos el reporte en la base de datos local de ms-reportes
        const nuevoReporte = await ReporteRepository.crear(data);

        // 2. Si el usuario adjuntó una foto, disparamos la vinculación en ms-multimedia
        if (id_multimedia) {
            // Se ejecuta de forma asíncrona para no bloquear la respuesta al usuario
            this.vincularMultimedia(id_multimedia, data.id_ciudadano, nuevoReporte.id);
        }

        return nuevoReporte;
    }

    /**
     * Comunicación interna (Inter-Service): Llama al ms-multimedia para vincular la foto.
     */
    private static async vincularMultimedia(
        id_multimedia: string,
        userId: string,
        reporteId: string,
    ) {
        try {
            const url = `${envs.MULTIMEDIA_SERVICE_URL}/api/v1/multimedia/${id_multimedia}/vincular`;

            await axios.patch(
                url,
                {},
                {
                    headers: {
                        'x-user-id': userId,
                        'x-internal-call': 'ms-reportes',
                    },
                },
            );

            logger.info(
                `✅ Imagen ${id_multimedia} vinculada exitosamente al reporte ${reporteId}`,
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`⚠️ Error vinculando multimedia ${id_multimedia}: ${errorMessage}`);
        }
    }

    static async obtenerReportes(
        limit: number,
        offset: number,
        usuarioAuth: { uid: string; rol: string },
        filtros: { estado?: string; categoria_id?: string },
    ) {
        return await ReporteRepository.obtenerTodos(limit, offset, filtros);
    }

    static async obtenerMisReportes(uid: string, limit: number, offset: number) {
        return await ReporteRepository.obtenerPorCiudadano(uid, limit, offset);
    }

    static async obtenerReportePorId(id: string) {
        const reporte = await ReporteRepository.obtenerPorId(id);
        if (!reporte) throw new AppError('El reporte solicitado no existe.', 404);
        return reporte;
    }

    static async actualizarReporte(
        reporteId: string,
        updateData: IUpdateReporteDTO,
        usuarioAuth: { uid: string; rol: string },
    ) {
        const reporte = await ReporteRepository.obtenerPorId(reporteId);
        if (!reporte) throw new AppError('Reporte no encontrado.', 404);

        if (reporte.id_ciudadano !== usuarioAuth.uid && usuarioAuth.rol !== UserRole.ADMIN) {
            throw new AppError('No tienes permiso para modificar este reporte.', 403);
        }

        if (reporte.estado !== EstadoReporte.PENDIENTE && usuarioAuth.rol !== UserRole.ADMIN) {
            throw new AppError('No puedes editar un reporte que ya está siendo procesado.', 400);
        }

        return await ReporteRepository.actualizarParcial(reporteId, updateData);
    }

    static async eliminarReporte(reporteId: string, usuarioAuth: { uid: string; rol: string }) {
        const reporte = await ReporteRepository.obtenerPorId(reporteId);
        if (!reporte) throw new AppError('Reporte no encontrado.', 404);

        if (reporte.id_ciudadano !== usuarioAuth.uid && usuarioAuth.rol !== UserRole.ADMIN) {
            throw new AppError('No tienes permiso para eliminar este reporte.', 403);
        }

        return await ReporteRepository.eliminar(reporteId);
    }

    static async obtenerHistorial(reporteId: string) {
        const reporte = await ReporteRepository.obtenerPorId(reporteId);
        if (!reporte) throw new AppError('Reporte no encontrado.', 404);
        return await ReporteRepository.obtenerHistorialPorReporte(reporteId);
    }

    static async cambiarEstado(
        reporteId: string,
        nuevoEstado: EstadoReporte,
        usuarioAuth: { uid: string; rol: string },
        comentarios?: string,
    ) {
        if (usuarioAuth.rol === UserRole.CIUDADANO) {
            throw new AppError(
                'Un ciudadano no tiene permisos para auditar estados de un incidente.',
                403,
            );
        }

        const reporteActual = await ReporteRepository.obtenerPorId(reporteId);
        if (!reporteActual) throw new AppError('Reporte no encontrado.', 404);

        if (reporteActual.estado === nuevoEstado) {
            throw new AppError(`El reporte ya se encuentra marcado como ${nuevoEstado}.`, 400);
        }

        if (ESTADOS_FINALES.has(reporteActual.estado) && nuevoEstado === EstadoReporte.PENDIENTE) {
            throw new AppError('Un incidente cerrado no puede volver a estado pendiente.', 400);
        }

        return await ReporteRepository.actualizarEstadoConHistorial(
            reporteId,
            reporteActual.estado,
            nuevoEstado,
            usuarioAuth.uid,
            comentarios,
        );
    }
}
