import {
  IMVEstadisticasDiarias,
  IAggregatedStats,
} from "../models/statistics.model";

export class RiesgoCalculator {
  public static procesarEstadisticas(
    datos: DeepReadonly<IMVEstadisticasDiarias[]>,
  ): IAggregatedStats {
    let totalIncidentes = 0;
    let sumaTiempoRespuesta = 0;
    const distribucionPorCategoria: Record<string, number> = {};
    const distribucionPorSeveridad: Record<string, number> = {};
    const tendenciaDiariaMap = new Map<string, number>();
    const medianas: number[] = [];

    for (const fila of datos) {
      totalIncidentes += fila.total_incidentes;
      sumaTiempoRespuesta += fila.prom_respuesta_seg * fila.total_incidentes;

      distribucionPorCategoria[fila.categoria] =
        (distribucionPorCategoria[fila.categoria] || 0) + fila.total_incidentes;
      distribucionPorSeveridad[fila.severidad] =
        (distribucionPorSeveridad[fila.severidad] || 0) + fila.total_incidentes;

      const totalDia = tendenciaDiariaMap.get(fila.fecha) || 0;
      tendenciaDiariaMap.set(fila.fecha, totalDia + fila.total_incidentes);

      medianas.push(fila.mediana_respuesta_seg);
    }

    const tiempoRespuestaPromedio =
      totalIncidentes > 0
        ? Math.round(sumaTiempoRespuesta / totalIncidentes)
        : 0;

    medianas.sort((a, b) => a - b);
    const tiempoRespuestaMediana =
      medianas.length > 0 ? medianas[Math.floor(medianas.length / 2)] : 0;

    const tendenciaDiaria = Array.from(tendenciaDiariaMap.entries())
      .map(([fecha, total]) => ({ fecha, total }))
      .sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      );

    return {
      totalIncidentes,
      tiempoRespuestaPromedio,
      tiempoRespuestaMediana,
      distribucionPorCategoria,
      distribucionPorSeveridad,
      tendenciaDiaria,
    };
  }
}
