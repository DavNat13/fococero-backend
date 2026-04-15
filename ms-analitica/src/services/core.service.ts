import { createHash } from "crypto";
import { analiticaRepository } from "../repositories/analitica.repository";
import { reportesCache } from "../cache/reportes.cache";
import { RedisMutex } from "../cache/redis.mutex";
import { RiesgoCalculator } from "../ml/riesgo.calculator";
import {
  AnomaliasDetector,
  IAnomaliaDetectada,
} from "../ml/anomalias.detector";
import { EstadisticasTransformer } from "../transformers/estadisticas.transformer";
import { TStatsQuery } from "../validators/analitica.validator";
import { IFactIncidente } from "../models/fact-incidente.model";

export interface IStatsProcesadas {
  readonly fecha: string;
  readonly es_fin_semana: boolean;
  readonly categoria: string;
  readonly severidad: "ALTA" | "MEDIA" | "BAJA";
  readonly total_incidentes: number;
  readonly prom_respuesta_seg: number;
  readonly mediana_respuesta_seg: number;
}

class CoreService {
  /**
   * Genera el ID del bloqueo de Redis usando la misma lógica de normalización que el caché.
   */
  private generarLockId(prefijo: string, params: TStatsQuery): string {
    const paramsRecord = params as unknown as Record<string, unknown>;
    const sortedParams = Object.keys(paramsRecord)
      .sort()
      .reduce(
        (acc, key) => {
          const value = paramsRecord[key];
          acc[key] = value instanceof Date ? value.toISOString() : value;
          return acc;
        },
        {} as Record<string, unknown>,
      );

    const hash = createHash("sha256")
      .update(JSON.stringify(sortedParams))
      .digest("hex");
    return `${prefijo}:${hash}`;
  }

  private async obtenerDatosBaseSeguros(
    params: TStatsQuery,
    cacheKey: string,
  ): Promise<IStatsProcesadas[]> {
    const cached = await reportesCache.getEstadisticas(params);
    if (cached && Array.isArray(cached)) return cached;

    const acquired = await RedisMutex.adquirirBloqueo(cacheKey, 15);
    if (!acquired) {
      await RedisMutex.esperarBloqueo(cacheKey);
      const retry = await reportesCache.getEstadisticas(params);
      if (retry && Array.isArray(retry)) return retry;
      throw new Error("Fallo de sincronización en caché");
    }

    try {
      const datosDb: IFactIncidente[] =
        await analiticaRepository.obtenerEstadisticasBase(params);

      // Transformamos a formato estadístico
      const procesadosRaw = RiesgoCalculator.procesarEstadisticas(
        datosDb as unknown as IStatsProcesadas[],
      );

      const datosProcesados = (Array.isArray(procesadosRaw)
        ? procesadosRaw
        : [procesadosRaw]) as unknown as IStatsProcesadas[];

      // Guardamos en caché pasando 'params' directamente
      await reportesCache.setEstadisticas(params, datosProcesados);

      return datosProcesados;
    } finally {
      await RedisMutex.liberarBloqueo(cacheKey);
    }
  }

  public async calcularKpis(params: TStatsQuery) {
    const key = this.generarLockId("lock:core:kpi", params);
    const datos = await this.obtenerDatosBaseSeguros(params, key);
    return EstadisticasTransformer.extraerKpis(datos);
  }

  public async calcularTendencias(params: TStatsQuery) {
    const key = this.generarLockId("lock:core:tendencia", params);
    const datos = await this.obtenerDatosBaseSeguros(params, key);
    return EstadisticasTransformer.extraerTendencias(datos);
  }

  public async calcularDistribucion(params: TStatsQuery) {
    const key = this.generarLockId("lock:core:dist", params);
    const datos = await this.obtenerDatosBaseSeguros(params, key);
    return EstadisticasTransformer.extraerDistribucion(datos);
  }

  public async detectarAnomalias(
    params: TStatsQuery,
  ): Promise<IAnomaliaDetectada[]> {
    const key = this.generarLockId("lock:core:anomalia", params);
    const datos = await this.obtenerDatosBaseSeguros(params, key);
    return AnomaliasDetector.analizarTendencias(datos);
  }
}

export const coreService = new CoreService();
