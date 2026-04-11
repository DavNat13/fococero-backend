// src/services/reporte.service.ts

import { ReporteRepository } from '../repositories/reporte.repository';
import { ICreateReporteDTO, IUpdateReporteDTO, EstadoReporte } from '../models/reporte.model';
import { UserRole } from '../models/user.enum';
import { AppError } from '../helpers/appError';

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
    static async crearReporte(data: ICreateReporteDTO) {
        return await ReporteRepository.crear(data);
    }

    static async obtenerReportes(
        limit: number,
        offset: number,
        usuarioAuth: { uid: string; rol: string },
        filtros: { estado?: string; categoria_id?: string },
    ) {
        // En un futuro aquí se puede inyectar lógica de filtrado por zona de brigada
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

        // 🔒 Regla: Solo el dueño o un Admin pueden editar
        if (reporte.id_ciudadano !== usuarioAuth.uid && usuarioAuth.rol !== UserRole.ADMIN) {
            throw new AppError('No tienes permiso para modificar este reporte.', 403);
        }

        // 🔒 Regla: Solo se permite edición ciudadana si está PENDIENTE
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

    // --- OPERACIONES Y AUDITORÍA ---
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
        // 🛡️ Solo Brigadistas o Admins pueden mover estados operativos
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

        // 🛡️ Regla de flujo: Un incidente resuelto o falso no vuelve a estar pendiente
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
