// src/controllers/alerta.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AlertaService } from '../services/alerta.service';

export class AlertaController {
    // 🟢 CREACIÓN
    static async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Extraemos el id_multimedia y el resto de los datos de la alerta
            const { id_multimedia, ...restBody } = req.body;

            // 2. Inyectamos el ID del usuario autenticado (desde el Gateway)
            const alertaData = {
                ...restBody,
                usuario_id: req.user!.uid,
            };

            // 3. Llamamos al servicio pasando ambos parámetros para que gestione la adopción de la foto
            const nuevaAlerta = await AlertaService.crearAlerta(alertaData, id_multimedia);

            res.status(201).json({
                ok: true,
                msg: 'Alerta registrada con éxito.',
                data: nuevaAlerta,
            });
        } catch (error) {
            next(error);
        }
    }

    // 🔵 LECTURAS Y CONSULTAS
    static async obtenerCercanas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const lng = parseFloat(req.query.lng as string);
            const lat = parseFloat(req.query.lat as string);
            const radio = req.query.radio ? parseInt(req.query.radio as string, 10) : 5000;

            if (isNaN(lng) || isNaN(lat)) {
                res.status(400).json({
                    ok: false,
                    error: 'Coordenadas espaciales inválidas o faltantes.',
                });
                return;
            }

            const alertas = await AlertaService.obtenerCercanas(lng, lat, radio);
            res.status(200).json({ ok: true, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerMisAlertas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alertas = await AlertaService.obtenerPorUsuario(req.user!.uid);
            res.status(200).json({ ok: true, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const alerta = await AlertaService.obtenerPorId(id);
            res.status(200).json({ ok: true, data: alerta });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerTodas(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alertas = await AlertaService.obtenerTodas();
            res.status(200).json({ ok: true, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    // 🟠 ACTUALIZACIÓN OPERATIVA
    static async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const alerta = await AlertaService.cambiarEstado(id, req.body.estado);
            res.status(200).json({
                ok: true,
                msg: 'Estado de la alerta actualizado.',
                data: alerta,
            });
        } catch (error) {
            next(error);
        }
    }

    static async verificar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const { esFuegoConfirmado } = req.body;

            if (typeof esFuegoConfirmado !== 'boolean') {
                res.status(400).json({
                    ok: false,
                    error: 'Debe indicar "esFuegoConfirmado" como booleano.',
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

    // 🔴 ELIMINACIÓN
    static async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            await AlertaService.eliminar(id);
            res.status(200).json({ ok: true, msg: 'La alerta ha sido eliminada del sistema.' });
        } catch (error) {
            next(error);
        }
    }
}
