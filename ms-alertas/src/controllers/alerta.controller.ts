// ==========================================
// 🎮 CONTROLADOR: MS-ALERTAS
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { AlertaService } from '../services/alerta.service';

export class AlertaController {
    // ============================================================================
    // 🟢 CREACIÓN
    // ============================================================================
    static async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Usamos (req as any) para evitar errores de TypeScript con el objeto user inyectado
            const alertaData = {
                ...req.body,
                // ✅ FIX: Busca ambas posibilidades dependiendo del Auth Middleware
                usuario_id: (req as any).user?.uid || (req as any).user?.firebase_uid,
            };
            const nuevaAlerta = await AlertaService.crearAlerta(alertaData);
            res.status(201).json({
                ok: true,
                msg: 'Alerta registrada con éxito.',
                data: nuevaAlerta,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🔵 LECTURAS Y CONSULTAS
    // ============================================================================
    static async obtenerCercanas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const lng = parseFloat(req.query.lng as string);
            const lat = parseFloat(req.query.lat as string);
            const radio = req.query.radio ? parseInt(req.query.radio as string, 10) : 5000;

            if (isNaN(lng) || isNaN(lat)) {
                res.status(400).json({
                    ok: false,
                    error: 'Faltan parámetros de coordenadas (lng, lat).',
                });
                return;
            }

            const alertas = await AlertaService.obtenerCercanas(lng, lat, radio);
            res.status(200).json({ ok: true, resultados: alertas.length, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerMisAlertas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // ✅ FIX: Blindaje aplicado también al historial personal
            const usuarioId = ((req as any).user?.uid || (req as any).user?.firebase_uid) as string;
            const alertas = await AlertaService.obtenerPorUsuario(usuarioId);
            res.status(200).json({ ok: true, resultados: alertas.length, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerTodas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alertas = await AlertaService.obtenerTodas();
            res.status(200).json({ ok: true, resultados: alertas.length, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const alerta = await AlertaService.obtenerPorId(id);
            res.status(200).json({ ok: true, data: alerta });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🟠 ACTUALIZACIONES OPERATIVAS
    // ============================================================================
    static async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const { estado } = req.body;

            if (!estado) {
                res.status(400).json({ ok: false, error: 'El campo "estado" es obligatorio.' });
                return;
            }

            const alertaActualizada = await AlertaService.cambiarEstado(id, estado);
            res.status(200).json({
                ok: true,
                msg: `Estado actualizado a ${estado}.`,
                data: alertaActualizada,
            });
        } catch (error) {
            next(error);
        }
    }

    static async verificar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const { esFuegoConfirmado } = req.body;

            if (typeof esFuegoConfirmado !== 'boolean') {
                res.status(400).json({
                    ok: false,
                    error: 'Debe indicar "esFuegoConfirmado" como booleano (true/false).',
                });
                return;
            }

            const alertaVerificada = await AlertaService.verificarAlerta(id, esFuegoConfirmado);
            res.status(200).json({
                ok: true,
                msg: esFuegoConfirmado
                    ? '¡Fuego confirmado! Alerta en proceso.'
                    : 'Falsa alarma descartada.',
                data: alertaVerificada,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================================================
    // 🔴 ELIMINACIÓN
    // ============================================================================
    static async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            await AlertaService.eliminar(id);
            res.status(200).json({ ok: true, msg: 'La alerta ha sido eliminada del mapa.' });
        } catch (error) {
            next(error);
        }
    }
}
