import { AxiosError } from 'axios';
import { externalHttpClient } from '../config/httpClient';
import { envs } from '../config/envs';
import { DespachoRepository } from '../repositories/despacho.repository';
import { AppError } from '../helpers/AppError';
import { Logger } from '../helpers/logger';
import {
    OrganismoType,
    DespachoStatus,
    ICreateDespachoDTO,
    IDespacho,
} from '../models/despacho.model';

const BATCH_CONCURRENCY = 3;

async function runBatch<T>(
    items: T[],
    fn: (item: T) => Promise<void>,
    batchSize: number,
): Promise<PromiseSettledResult<void>[]> {
    const results: PromiseSettledResult<void>[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch.map(fn));
        results.push(...batchResults);
    }
    return results;
}

export class DespachoService {
    /**
     * Procesa un despacho de emergencia hacia un organismo externo.
     * Garantiza el registro en base de datos antes de la llamada HTTP para evitar pérdida de trazabilidad.
     */
    static async procesarDespacho(data: ICreateDespachoDTO): Promise<IDespacho> {
        this.validateEndpointUrl(data.endpoint_url);

        const log = await DespachoRepository.create(data);

        try {
            const { data: responseBody, duration_ms } = await externalHttpClient.post(
                data.endpoint_url,
                data.request_payload,
                {
                    params: { correlation_id: data.correlation_id },
                    headers: { 'X-Api-Key': this.getApiKey(data.organismo) },
                },
            );

            await DespachoRepository.finish(log.id, {
                estado: DespachoStatus.EXITOSO,
                response_payload: responseBody,
                duracion_ms: duration_ms || 0,
            });
        } catch (error) {
            await this.handleDespachoError(log.id, data.organismo, error);
        }

        const finalLogs = await DespachoRepository.findByCorrelationId(data.correlation_id);
        const finalLog = Array.isArray(finalLogs)
            ? finalLogs.find((l) => l.organismo === data.organismo) || finalLogs[0]
            : finalLogs;
        if (!finalLog)
            throw new AppError('Error crítico al recuperar el log final del despacho', 500);

        return finalLog;
    }

    static async reintentarDespachosFallidos(): Promise<void> {
        const fallidos = await DespachoRepository.getPendingRetries();
        if (fallidos.length === 0) return;

        Logger.info(`🔄 Iniciando reintento de ${fallidos.length} despachos...`);

        const results = await runBatch(
            fallidos,
            async (d) => {
                await this.procesarDespacho({
                    alerta_id: d.alerta_id,
                    correlation_id: d.correlation_id,
                    organismo: d.organismo,
                    prioridad: d.prioridad,
                    request_payload: d.request_payload,
                    endpoint_url: d.endpoint_url,
                });
            },
            BATCH_CONCURRENCY,
        );

        const rejected = results.filter((r) => r.status === 'rejected');
        if (rejected.length > 0) {
            Logger.error(`❌ ${rejected.length} reintentos fallaron nuevamente en esta ronda.`);
        }
    }

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

            const customError = error as AxiosError & { duration_ms?: number };
            duration = customError.duration_ms || 0;
        }

        await DespachoRepository.finish(logId, {
            estado: DespachoStatus.FALLIDO,
            response_payload: responseData,
            duracion_ms: duration,
            codigo_error_http: statusCode,
            error_detalle: errorMsg,
        });

        throw new AppError(`Fallo crítico en despacho a ${organismo}: ${errorMsg}`, statusCode);
    }

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
        const key = keyMap[organismo];
        if (!key) {
            throw new AppError(`Organismo no configurado: ${organismo}`, 501);
        }
        return key;
    }

    private static validateEndpointUrl(url: string): void {
        const allowedPatterns = [
            /^https:\/\/(api\.)?(bomberos|conaf|carabineros|senapred)\.cl\//,
        ];
        const isAllowed = allowedPatterns.some((pattern) => pattern.test(url));
        if (!isAllowed) {
            throw new AppError(`URL de endpoint no permitida: ${url}`, 400);
        }
    }
}
