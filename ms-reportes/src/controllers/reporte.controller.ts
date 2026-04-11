import { Request, Response } from 'express';
import { ReporteService } from '../services/reporte.service';
import { catchAsync } from '../helpers/catchAsync';

export class ReporteController {
    // --- CATEGORÍAS ---

    /**
     * Obtiene todas las categorías de incidentes activas.
     */
    static obtenerCategorias = catchAsync(async (_req: Request, res: Response) => {
        const categorias = await ReporteService.obtenerCategorias();
        res.status(200).json({
            ok: true,
            data: categorias,
        });
    });

    // --- REPORTES ---

    /**
     * Crea un nuevo reporte ciudadano.
     * Utiliza req.user.uid inyectado por el middleware de autenticación.
     */
    static crearReporte = catchAsync(async (req: Request, res: Response) => {
        const data = {
            ...req.body,
            id_ciudadano: req.user!.uid,
        };

        const nuevoReporte = await ReporteService.crearReporte(data);

        res.status(201).json({
            ok: true,
            msg: 'Reporte creado exitosamente',
            data: nuevoReporte,
        });
    });

    /**
     * Obtiene el listado global de reportes con paginación y filtros por estado o categoría.
     */
    static obtenerReportes = catchAsync(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const offset = parseInt(req.query.offset as string, 10) || 0;

        // Extraemos filtros opcionales de la query string
        const filtros = {
            estado: req.query.estado as string,
            categoria_id: req.query.categoria_id as string,
        };

        const usuarioAuth = { uid: req.user!.uid, rol: req.user!.rol };
        const resultado = await ReporteService.obtenerReportes(limit, offset, usuarioAuth, filtros);

        res.status(200).json({
            ok: true,
            data: resultado.data,
            paginacion: {
                total: resultado.total,
                limit,
                offset,
            },
        });
    });

    /**
     * Obtiene los reportes creados exclusivamente por el usuario autenticado.
     */
    static obtenerMisReportes = catchAsync(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const offset = parseInt(req.query.offset as string, 10) || 0;

        const resultado = await ReporteService.obtenerMisReportes(req.user!.uid, limit, offset);

        res.status(200).json({
            ok: true,
            data: resultado.data,
            paginacion: { total: resultado.total, limit, offset },
        });
    });

    static obtenerReportePorId = catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const reporte = await ReporteService.obtenerReportePorId(id);

        res.status(200).json({ ok: true, data: reporte });
    });

    /**
     * Permite la edición parcial de un reporte (solo si está PENDIENTE y el usuario es dueño).
     */
    static actualizarReporte = catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const usuarioAuth = { uid: req.user!.uid, rol: req.user!.rol };

        const reporteActualizado = await ReporteService.actualizarReporte(
            id,
            req.body,
            usuarioAuth,
        );

        res.status(200).json({
            ok: true,
            msg: 'Reporte modificado exitosamente',
            data: reporteActualizado,
        });
    });

    /**
     * Elimina físicamente un reporte del sistema.
     */
    static eliminarReporte = catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const usuarioAuth = { uid: req.user!.uid, rol: req.user!.rol };

        await ReporteService.eliminarReporte(id, usuarioAuth);

        res.status(200).json({
            ok: true,
            msg: 'Reporte eliminado definitivamente.',
        });
    });

    // --- OPERACIONES Y AUDITORÍA ---

    /**
     * Cambia el estado operativo de un reporte (solo Brigadistas/Admin).
     * Registra automáticamente el cambio en el historial.
     */
    static cambiarEstado = catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const { nuevoEstado, comentarios } = req.body;
        const usuarioAuth = { uid: req.user!.uid, rol: req.user!.rol };

        const reporteActualizado = await ReporteService.cambiarEstado(
            id,
            nuevoEstado,
            usuarioAuth,
            comentarios,
        );

        res.status(200).json({
            ok: true,
            msg: `Estado actualizado a ${nuevoEstado}`,
            data: reporteActualizado,
        });
    });

    /**
     * Obtiene la trazabilidad completa de cambios de estado de un reporte específico.
     */
    static obtenerHistorial = catchAsync(async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const historial = await ReporteService.obtenerHistorial(id);

        res.status(200).json({
            ok: true,
            data: historial,
        });
    });
}
