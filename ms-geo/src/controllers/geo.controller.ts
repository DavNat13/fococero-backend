// src/controllers/geo.controller.ts

import { Request, Response, NextFunction } from 'express';
import { GeoService } from '../services/geo.service';
import { GeoValidator } from '../validators/geo.validator';

/**
 * GeoController: Gestiona la inteligencia geoespacial de FocoCero.
 * Actúa estrictamente como director de tráfico.
 */
export class GeoController {

    // ============================================================================
    // 🟢 SECCIÓN: CREACIÓN (REPORTES CIUDADANOS)
    // ============================================================================

    static async reportarFoco(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validation = GeoValidator.validarCreacion(req.body);
            if (!validation.isValid) {
                res.status(400).json({ ok: false, error: validation.error });
                return;
            }

            const nuevoFoco = await GeoService.crearFoco(req.body);
            
            res.status(201).json({ 
                ok: true, 
                msg: 'Incendio reportado y geolocalizado con éxito.', 
                data: nuevoFoco 
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🔵 SECCIÓN: LECTURA (MONITOREO GLOBAL Y RADAR)
    // ============================================================================

    static async obtenerTodos(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const focos = await GeoService.obtenerTodos();
            res.status(200).json({ ok: true, data: focos });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Solución al error de tipado: Forzamos (cast) a string
            const id = req.params.id as string; 
            const foco = await GeoService.obtenerPorId(id);
            res.status(200).json({ ok: true, data: foco });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerCercanos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Extraemos y convertimos los parámetros de la URL (?lat=...&lng=...&radio=...)
            const lat = parseFloat(req.query.lat as string);
            const lng = parseFloat(req.query.lng as string);
            const radio = parseInt(req.query.radio as string, 10);

            if (isNaN(lat) || isNaN(lng) || isNaN(radio)) {
                res.status(400).json({ 
                    ok: false, 
                    error: 'Faltan parámetros espaciales. Debes enviar lat (numérico), lng (numérico) y radio (metros).' 
                });
                return;
            }

            const focosCercanos = await GeoService.obtenerCercanos(lat, lng, radio);
            res.status(200).json({ ok: true, data: focosCercanos });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🟠 SECCIÓN: ACTUALIZACIÓN (OPERATIVA Y ESPACIAL)
    // ============================================================================

    static async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const { estado } = req.body;

            // Usamos el validador con el nombre correcto que definimos
            const validation = GeoValidator.validarEstado(estado);
            if (!validation.isValid) {
                res.status(400).json({ ok: false, error: validation.error });
                return;
            }

            const actualizado = await GeoService.cambiarEstado(id, estado);
            res.status(200).json({ 
                ok: true, 
                msg: `Estado operativo actualizado a: ${estado}`, 
                data: actualizado 
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizarPerimetro(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const { area_quemada_wkt } = req.body;

            const validation = GeoValidator.validarPerimetroWKT(area_quemada_wkt);
            if (!validation.isValid) {
                res.status(400).json({ ok: false, error: validation.error });
                return;
            }

            const actualizado = await GeoService.actualizarPerimetro(id, area_quemada_wkt);
            res.status(200).json({ 
                ok: true, 
                msg: 'Perímetro espacial del incendio actualizado en el mapa táctico.', 
                data: actualizado 
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizarCompleto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const actualizado = await GeoService.actualizarCompleto(id, req.body);
            res.status(200).json({ 
                ok: true, 
                msg: 'Información integral del reporte actualizada.', 
                data: actualizado 
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🔴 SECCIÓN: ELIMINACIÓN (LIMPIEZA DE DATOS)
    // ============================================================================

    static async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            await GeoService.eliminar(id);
            res.status(200).json({ ok: true, msg: 'Reporte removido exitosamente del sistema operativo.' });
        } catch (error) {
            next(error);
        }
    }
}