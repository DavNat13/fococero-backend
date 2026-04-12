import { AxiosError } from 'axios';
import { httpClient } from '../config/httpClient';
import { envs } from '../config/envs';
import { DespachoRepository } from '../repositories/despacho.repository';
import { AppError } from '../helpers/AppError';
import {
    OrganismoType,
    DespachoStatus,
    ICreateDespachoDTO,
    IDespacho,
} from '../models/despacho.model';

export class DespachoService {
    /**
     * Procesa un despacho de emergencia hacia un organismo externo.
     * Garantiza el registro en base de datos antes de la llamada HTTP para evitar pérdida de trazabilidad.
     */
    static async procesarDespacho(data: ICreateDespachoDTO): Promise<IDespacho> {
        // 1. Registro inicial atómico (Estado PENDIENTE)
        const log = await DespachoRepository.create(data);

        try {
            // 2. Ejecutar la llamada al organismo externo
            const { data: responseBody, duration_ms } = await httpClient.post(
                data.endpoint_url,
                data.request_payload,
                {
                    params: { correlation_id: data.correlation_id },
                    headers: { 'X-Api-Key': this.getApiKey(data.organismo) },
                },
            );

            // 3. Éxito: Actualizar log con payload de respuesta y métricas
            await DespachoRepository.finish(log.id, {
                estado: DespachoStatus.EXITOSO,
                response_payload: responseBody,
                duracion_ms: duration_ms || 0,
            });
        } catch (error) {
            // 4. Fallo: Delegar al manejador centralizado
            await this.handleDespachoError(log.id, data.organismo, error);
        }

        // 5. Retornar el log final actualizado
        const finalLog = await DespachoRepository.findByCorrelationId(data.correlation_id);
        if (!finalLog)
            throw new AppError('Error crítico al recuperar el log final del despacho', 500);

        return finalLog;
    }

    /**
     * Ejecuta reintentos pendientes de forma concurrente para maximizar el throughput.
     * Ideal para ser consumido por un CronJob.
     */
    static async reintentarDespachosFallidos(): Promise<void> {
        const fallidos = await DespachoRepository.getPendingRetries();
        if (fallidos.length === 0) return;

        console.log(`🔄 Iniciando reintento de ${fallidos.length} despachos...`);

        // Ejecución en paralelo: evita cuellos de botella si un organismo responde lento
        const results = await Promise.allSettled(
            fallidos.map((d) =>
                this.procesarDespacho({
                    alerta_id: d.alerta_id,
                    correlation_id: d.correlation_id,
                    organismo: d.organismo,
                    prioridad: d.prioridad,
                    request_payload: d.request_payload,
                    endpoint_url: d.endpoint_url,
                }),
            ),
        );

        const rejected = results.filter((r) => r.status === 'rejected');
        if (rejected.length > 0) {
            console.error(`❌ ${rejected.length} reintentos fallaron nuevamente en esta ronda.`);
        }
    }

    /**
     * Centraliza el mapeo y persistencia de errores de integración de forma segura (Tipado Exhaustivo).
     */
    private static async handleDespachoError(
        logId: string,
        organismo: string,
        error: unknown,
    ): Promise<void> {
        let statusCode = 500;
        let errorMsg = 'Error interno de comunicación';
        let responseData = null;
        let duration = 0;

        if (error instanceof AxiosError) {
            statusCode = error.response?.status || 500;
            responseData = error.response?.data || null;
            errorMsg = responseData?.message || error.message;

            // Intersección de tipos: respeta la regla noImplicitAny mientras lee la métrica inyectada
            const customError = error as AxiosError & { duration_ms?: number };
            duration = customError.duration_ms || 0;
        }

        // Actualizar el registro para permitir un futuro reintento
        await DespachoRepository.finish(logId, {
            estado: DespachoStatus.FALLIDO,
            response_payload: responseData,
            duracion_ms: duration,
            codigo_error_http: statusCode,
            error_detalle: errorMsg,
        });

        throw new AppError(`Fallo crítico en despacho a ${organismo}: ${errorMsg}`, statusCode);
    }

    /**
     * Resuelve de forma segura la API Key correcta basada en el mapeo de organismos.
     */
    private static getApiKey(organismo: OrganismoType): string {
        const keyMap: Record<OrganismoType, string | undefined> = {
            [OrganismoType.BOMBEROS]: envs.BOMBEROS_API_KEY,
            [OrganismoType.CONAF]: envs.CONAF_API_KEY,
            [OrganismoType.SENAPRED]: envs.SENAPRED_API_KEY,
            [OrganismoType.CARABINEROS]: envs.CARABINEROS_API_KEY,
            [OrganismoType.SAMU]: undefined,
            [OrganismoType.PDI]: undefined,
            [OrganismoType.MUNICIPALIDAD]: undefined,
            [OrganismoType.DELEGACION]: undefined,
            [OrganismoType.EJERCITO]: undefined,
            [OrganismoType.ARMADA]: undefined,
            [OrganismoType.SERVICIOS_PUBLICOS]: undefined,
        };
        return keyMap[organismo] ?? '';
    }
}
