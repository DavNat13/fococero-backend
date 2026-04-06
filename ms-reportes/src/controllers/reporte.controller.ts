// src/controllers/reporte.controller.ts
import { Request, Response } from 'express';
import { ReporteService } from '../services/reporte.service';
import { catchAsync } from '../helpers/catchAsync';

export class ReporteController {
    /**
     * [POST] /api/reportes
     */
    static crearReporte = catchAsync(async (req: Request, res: Response) => {
        // 🛡️ Seguridad: Buscamos el ID en ambas propiedades posibles del objeto user
        const data = {
            ...req.body,
            id_ciudadano: (req as any).user?.uid || (req as any).user?.firebase_uid,
        };

        const nuevoReporte = await ReporteService.crearReporte(data);

        res.status(201).json({
            ok: true,
            msg: 'Reporte creado exitosamente',
            data: nuevoReporte,
        });
    });

    /**
     * [GET] /api/reportes
     */
    static obtenerReportes = catchAsync(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const offset = parseInt(req.query.offset as string, 10) || 0;
        const usuarioAuth = (req as any).user;

        const resultado = await ReporteService.obtenerReportes(limit, offset, usuarioAuth);

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
     * [GET] /api/reportes/:id
     */
    static obtenerReportePorId = catchAsync(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const reporte = await ReporteService.obtenerReportePorId(id);

        res.status(200).json({
            ok: true,
            data: reporte,
        });
    });

    /**
     * [PATCH] /api/reportes/:id/estado
     */
    static cambiarEstado = catchAsync(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { nuevoEstado, comentarios } = req.body;
        const usuarioAuth = (req as any).user;

        const reporteActualizado = await ReporteService.cambiarEstado(
            id,
            nuevoEstado,
            usuarioAuth,
            comentarios,
        );

        res.status(200).json({
            ok: true,
            msg: `Estado del reporte actualizado a ${nuevoEstado}`,
            data: reporteActualizado,
        });
    });
}