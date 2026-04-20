// src/controllers/geo.controller.ts
import { Request, Response } from 'express';
import { GeoService } from '../services/geo.service';
import { catchAsync } from '../helpers/catchAsync';

export class GeoController {
    // --- SECCIÓN CIUDADANA ---

    static reportarFoco = catchAsync(async (req: Request, res: Response) => {
        const nuevoFoco = await GeoService.crearFoco(req.body);
        res.status(201).json({ ok: true, data: nuevoFoco });
    });

    static obtenerTodos = catchAsync(async (_req: Request, res: Response) => {
        const focos = await GeoService.obtenerTodos();
        res.status(200).json({ ok: true, data: focos });
    });

    static obtenerPorId = catchAsync(async (req: Request, res: Response) => {
        const foco = await GeoService.obtenerPorId(String(req.params.id));
        res.status(200).json({ ok: true, data: foco });
    });

    static obtenerCercanos = catchAsync(async (req: Request, res: Response) => {
        const { lat, lng, radio } = req.query as unknown as {
            lat: number;
            lng: number;
            radio: number;
        };
        const focosCercanos = await GeoService.obtenerCercanos(lat, lng, radio);
        res.status(200).json({ ok: true, data: focosCercanos });
    });

    // --- SECCIÓN OPERATIVA ---

    static cambiarEstado = catchAsync(async (req: Request, res: Response) => {
        const actualizado = await GeoService.cambiarEstado(String(req.params.id), req.body.estado);
        res.status(200).json({ ok: true, msg: 'Estado actualizado', data: actualizado });
    });

    static actualizarPerimetro = catchAsync(async (req: Request, res: Response) => {
        const actualizado = await GeoService.actualizarPerimetro(
            String(req.params.id),
            req.body.area_quemada_wkt,
        );
        res.status(200).json({ ok: true, msg: 'Perímetro actualizado', data: actualizado });
    });

    /**
     * Actualización Integral (PUT): Recalcula severidad si cambian factores climáticos.
     */
    static actualizarCompleto = catchAsync(async (req: Request, res: Response) => {
        const actualizado = await GeoService.actualizarCompleto(String(req.params.id), req.body);
        res.status(200).json({
            ok: true,
            msg: 'Información integral del reporte actualizada.',
            data: actualizado,
        });
    });

    static eliminar = catchAsync(async (req: Request, res: Response) => {
        await GeoService.eliminar(String(req.params.id));
        res.status(200).json({ ok: true, msg: 'Reporte removido exitosamente.' });
    });
}
