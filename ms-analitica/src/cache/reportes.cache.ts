import { createHash } from "crypto";
import { redisCache } from "../config/redis";
import { TStatsQuery, THeatmapQuery } from "../validators/analitica.validator";
import { IHeatmapGeoJSON } from "../models/heatmap.model";
import { IStatsProcesadas } from "../services/core.service";

/**
 * Interfaz para acceder al cliente de Redis de forma segura sin usar 'any'.
 */
interface IRedisWrapper {
  client?: {
    keys: (pattern: string) => Promise<string[]>;
    del: (...keys: string[]) => Promise<number>;
  };
}

class ReportesCache {
  private readonly TTL_SECONDS = 3600;

  private generarClaveHash<T extends Record<string, unknown>>(
    prefix: string,
    params: T,
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          const value = params[key];
          // Normalizamos fechas para que el hash sea consistente
          acc[key] = value instanceof Date ? value.toISOString() : value;
          return acc;
        },
        {} as Record<string, unknown>,
      );

    const hash = createHash("sha256")
      .update(JSON.stringify(sortedParams))
      .digest("hex");
    return `${prefix}:${hash}`;
  }

  public async getEstadisticas(
    params: TStatsQuery,
  ): Promise<IStatsProcesadas[] | null> {
    const key = this.generarClaveHash(
      "stats",
      params as unknown as Record<string, unknown>,
    );
    return redisCache.get<IStatsProcesadas[]>(key);
  }

  public async setEstadisticas(
    params: TStatsQuery,
    data: IStatsProcesadas[],
  ): Promise<void> {
    const key = this.generarClaveHash(
      "stats",
      params as unknown as Record<string, unknown>,
    );
    await redisCache.set(key, data, this.TTL_SECONDS);
  }

  public async getMapaCalor(
    params: THeatmapQuery,
  ): Promise<IHeatmapGeoJSON | null> {
    const key = this.generarClaveHash(
      "heatmap",
      params as unknown as Record<string, unknown>,
    );
    return redisCache.get<IHeatmapGeoJSON>(key);
  }

  public async setMapaCalor(
    params: THeatmapQuery,
    data: IHeatmapGeoJSON,
  ): Promise<void> {
    const key = this.generarClaveHash(
      "heatmap",
      params as unknown as Record<string, unknown>,
    );
    await redisCache.set(key, data, this.TTL_SECONDS);
  }

  public async invalidarCachesGlobales(): Promise<void> {
    // Accedemos al cliente interno mediante un casteo seguro a unknown
    const wrapper = redisCache as unknown as IRedisWrapper;
    const client = wrapper.client;

    if (!client) return;

    const heatmapKeys = await client.keys("heatmap:*");
    const statsKeys = await client.keys("stats:*");

    const allKeys = [...heatmapKeys, ...statsKeys];
    if (allKeys.length > 0) {
      await client.del(...allKeys);
    }
  }
}

export const reportesCache = new ReportesCache();
