import { Request, Response } from 'express';
import { DespachoService } from '../services/despacho.service';
import { DespachoRepository } from '../repositories/despacho.repository';
import { successResponse } from '../helpers/handleResponse';
import { asyncHandler } from '../helpers/asyncHandler';
import { AppError } from '../helpers/AppError';

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
            console.error('Error en proceso de reintento en background:', err),
        );
        return successResponse(res, null, 'Proceso de reintento iniciado en segundo plano', 202);
    });

    /**
     * @GET Consulta el estado de un despacho específico (ideal para el Frontend o ms-alertas).
     */
    static getStatus = asyncHandler(async (req: Request, res: Response) => {
        // Aserción explícita a string para satisfacer el tipado estricto
        const correlation_id = req.params.correlation_id as string;
        
        const log = await DespachoRepository.findByCorrelationId(correlation_id);

        if (!log) {
            throw new AppError('No se encontró registro de despacho para este ID', 404);
        }

        return successResponse(res, log, 'Estado de despacho recuperado');
    });

    /**
     * @PATCH Recibe actualizaciones de estado asíncronas (Webhooks de Bomberos/CONAF).
     */
    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
        // Aserción explícita a string
        const id = req.params.id as string;
        const { estado } = req.body;

        await DespachoRepository.updateStatus(id, estado);

        return successResponse(res, null, 'Estado actualizado correctamente');
    });
}