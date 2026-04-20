import { createHash } from "crypto";
import { analiticaRepository } from "../repositories/analitica.repository";
import { reportesCache } from "../cache/reportes.cache";
import { RedisMutex } from "../cache/redis.mutex";
import { GeoJsonTransformer } from "../ml/geojson.transformer";
import {
  THeatmapQuery,
  TGeoHashQuery,
  TRadioQuery,
} from "../validators/analitica.validator";
import { IFactIncidente } from "../models/fact-incidente.model";
import { IMVMapaCalorGeohash } from "../models/heatmap.model";

class EspacialService {
  /**
   * Genera un ID de bloqueo único.
   * Normaliza las fechas a ISO string para que el hash sea determinista.
   */
  private generarLockId(
    prefijo: string,
    params: THeatmapQuery | TRadioQuery,
  ): string {
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

  public async generarMapaCalor(params: THeatmapQuery) {
    const cacheKey = this.generarLockId("lock:espacial:heatmap", params);

    // 1. Intentar obtener del caché (ahora acepta THeatmapQuery directamente)
    let cachedMap = await reportesCache.getMapaCalor(params);
    if (cachedMap) return cachedMap;

    const acquired = await RedisMutex.adquirirBloqueo(cacheKey, 15);
    if (!acquired) {
      await RedisMutex.esperarBloqueo(cacheKey);
      cachedMap = await reportesCache.getMapaCalor(params);
      if (!cachedMap)
        throw new Error("Consistencia de caché geoespacial fallida");
      return cachedMap;
    }

    try {
      // 2. Obtener datos crudos de la DB (IFactIncidente[])
      const datosDb: IFactIncidente[] =
        await analiticaRepository.obtenerDatosMapaCalor(params);

      /**
       * SOLUCIÓN AL ERROR:
       * Mapeamos los datos de la DB al contrato IMVMapaCalorGeohash.
       * Incluimos el 'geohash' que es obligatorio y calculamos la 'intensidad'.
       */
      const datosParaMapa: IMVMapaCalorGeohash[] = datosDb.map((inc) => ({
        geohash: inc.geohash,
        categoria: inc.categoria,
        intensidad:
          inc.severidad === "ALTA"
            ? 1.0
            : inc.severidad === "MEDIA"
              ? 0.7
              : 0.4,
      }));

      // 3. Transformación a GeoJSON (Sin usar 'any', usando el contrato estricto)
      const geoJson = GeoJsonTransformer.aMapaCalor(datosParaMapa);

      // 4. Guardar en caché
      await reportesCache.setMapaCalor(params, geoJson);

      return geoJson;
    } finally {
      await RedisMutex.liberarBloqueo(cacheKey);
    }
  }

  public async obtenerDetallePorGeohash(params: TGeoHashQuery) {
    return analiticaRepository.obtenerIncidentesPorGeohash(
      params.geohash,
      params.limite,
    );
  }

  public async obtenerIncidentesPorRadio(params: TRadioQuery) {
    const cacheKey = this.generarLockId("lock:espacial:radio", params);

    const acquired = await RedisMutex.adquirirBloqueo(cacheKey, 10);
    if (!acquired)
      throw new Error("Área en procesamiento. Reintente en breve.");

    try {
      return await analiticaRepository.obtenerIncidentesPorRadio(
        params.lat,
        params.lng,
        params.radioMetros,
        params.startDate,
        params.endDate,
      );
    } finally {
      await RedisMutex.liberarBloqueo(cacheKey);
    }
  }
}

export const espacialService = new EspacialService();
