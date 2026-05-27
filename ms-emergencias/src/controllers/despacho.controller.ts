import { Request, Response } from 'express';
import { DespachoService } from '../services/despacho.service';
import { DespachoRepository } from '../repositories/despacho.repository';
import { successResponse } from '../helpers/handleResponse';
import { asyncHandler } from '../helpers/asyncHandler';
import { AppError } from '../helpers/AppError';
import { isValidTransition } from '../validators/despacho.validator';
import { DespachoStatus } from '../models/despacho.model';
import { Logger } from '../helpers/logger';

export class DespachoController {
    /**
     * @POST Inicia un nuevo proceso de despacho.
     */
    static create = asyncHandler(async (req: Request, res: Response) => {
        const result = await DespachoService.procesarDespacho(req.body);
        return successResponse(res, result, 'Despacho procesado e iniciado correctamente', 201);
    });

    /**
     * @POST Dispara manualmente el reintento de todos los despachos fallidos.
     */
    static retry = asyncHandler(async (_req: Request, res: Response) => {
        // En producción, esto no se espera, se lanza en background
        DespachoService.reintentarDespachosFallidos().catch((err) =>
            Logger.error('Error en proceso de reintento en background:', err),
        );
        return successResponse(res, null, 'Proceso de reintento iniciado en segundo plano', 202);
    });

    /**
     * @GET Consulta los despachos asociados a un correlation_id.
     */
    static getStatus = asyncHandler(async (req: Request, res: Response) => {
        const correlation_id = req.params.correlation_id as string;

        const logs = await DespachoRepository.findByCorrelationId(correlation_id);

        if (logs.length === 0) {
            throw new AppError('No se encontraron registros de despacho para este ID', 404);
        }

        return successResponse(res, logs, 'Estado(s) de despacho recuperado(s)');
    });

    /**
     * @PATCH Recibe actualizaciones de estado asíncronas (Webhooks de Bomberos/CONAF).
     */
    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { estado } = req.body as { estado: DespachoStatus };

        const despacho = await DespachoRepository.findById(id);
        if (!despacho) {
            throw new AppError('Despacho no encontrado', 404);
        }

        if (!isValidTransition(despacho.estado, estado)) {
            throw new AppError(
                `Transición inválida: ${despacho.estado} -> ${estado}`,
                400,
            );
        }

        await DespachoRepository.updateStatus(id, estado);

        return successResponse(res, null, 'Estado actualizado correctamente');
    });
}