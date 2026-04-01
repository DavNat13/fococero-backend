// src/services/reporte.service.ts
import { ReporteRepository } from '../repositories/reporte.repository';
import { ICreateReporteDTO, EstadoReporte } from '../models/reporte.model';
import { UserRole } from '../models/user.enum';
import { AppError } from '../helpers/appError';

// 🚀 OPTIMIZACIÓN DE MEMORIA: 
// Definimos el set de estados finales AFUERA de la función como un Set nativo.
// Los Sets tienen búsqueda O(1) (instantánea), a diferencia de los Arrays que son O(n).
const ESTADOS_FINALES = new Set<EstadoReporte>([
    EstadoReporte.RESUELTO, 
    EstadoReporte.FALSA_ALARMA
]);

export class ReporteService {
    
    static async crearReporte(data: ICreateReporteDTO) {
        // En el futuro: Validar cuota por usuario (Rate limit a nivel de DB)
        return await ReporteRepository.crear(data);
    }

    static async obtenerReportes(limit: number, offset: number, usuarioAuth: { uid: string, rol: string }) {
        if (usuarioAuth.rol === UserRole.CIUDADANO) {
            // Lógica futura: Obtener solo los de su comuna
            // return await ReporteRepository.obtenerPorRadioEspacial(...);
        }
        
        return await ReporteRepository.obtenerTodos(limit, offset);
    }

    static async obtenerReportePorId(id: string) {
        const reporte = await ReporteRepository.obtenerPorId(id);
        
        if (!reporte) {
            // 🚀 OPTIMIZACIÓN V8: Usamos nuestra clase pre-compilada
            throw new AppError('El reporte solicitado no existe.', 404);
        }

        return reporte;
    }

    static async cambiarEstado(
        reporteId: string, 
        nuevoEstado: EstadoReporte, 
        usuarioAuth: { uid: string, rol: string }, 
        comentarios?: string
    ) {
        // 1. Defensa en profundidad: Bloqueo temprano antes de tocar la BD
        if (usuarioAuth.rol === UserRole.CIUDADANO) {
            throw new AppError('Un ciudadano no tiene permisos para auditar estados de un incendio.', 403);
        }

        // 2. Buscamos el reporte
        const reporteActual = await ReporteRepository.obtenerPorId(reporteId);
        if (!reporteActual) {
            throw new AppError('Reporte no encontrado.', 404);
        }

        // 3. Regla: Evitar transacciones inútiles
        if (reporteActual.estado === nuevoEstado) {
            throw new AppError(`El reporte ya se encuentra marcado como ${nuevoEstado}.`, 400);
        }

        // 4. Regla: Flujo lógico de estados (Búsqueda O(1) ultra rápida en el Set)
        if (ESTADOS_FINALES.has(reporteActual.estado) && nuevoEstado === EstadoReporte.PENDIENTE) {
            throw new AppError('Un incidente cerrado no puede volver a estado pendiente.', 400);
        }

        // 5. Ejecutamos la transacción en PostgreSQL
        return await ReporteRepository.actualizarEstadoConHistorial(
            reporteId,
            reporteActual.estado,
            nuevoEstado,
            usuarioAuth.uid,
            comentarios
        );
    }
} 