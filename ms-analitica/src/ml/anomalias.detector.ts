import { IMVEstadisticasDiarias } from "../models/statistics.model";

export interface IAnomaliaDetectada {
  fecha: string;
  total: number;
  mediaEsperada: number;
  desviacionEstandar: number;
  zScore: number;
  esCritica: boolean;
}

export class AnomaliasDetector {
  public static analizarTendencias(
    datos: DeepReadonly<IMVEstadisticasDiarias[]>,
  ): IAnomaliaDetectada[] {
    if (datos.length < 7) {
      return [];
    }

    const totalesPorDia = new Map<string, number>();
    for (const fila of datos) {
      const actual = totalesPorDia.get(fila.fecha) || 0;
      totalesPorDia.set(fila.fecha, actual + fila.total_incidentes);
    }

    const valores = Array.from(totalesPorDia.values());
    const media = this.calcularMedia(valores);
    const desviacionEstandar = this.calcularDesviacionEstandar(valores, media);

    const anomalias: IAnomaliaDetectada[] = [];

    for (const [fecha, total] of totalesPorDia.entries()) {
      const zScore =
        desviacionEstandar === 0 ? 0 : (total - media) / desviacionEstandar;

      if (zScore > 2.0) {
        anomalias.push({
          fecha,
          total,
          mediaEsperada: Number(media.toFixed(2)),
          desviacionEstandar: Number(desviacionEstandar.toFixed(2)),
          zScore: Number(zScore.toFixed(2)),
          esCritica: zScore > 3.0,
        });
      }
    }

    return anomalias.sort((a, b) => b.zScore - a.zScore);
  }

  private static calcularMedia(valores: number[]): number {
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return suma / valores.length;
  }

  private static calcularDesviacionEstandar(
    valores: number[],
    media: number,
  ): number {
    const sumaDiferenciasCuadradas = valores.reduce((acc, val) => {
      const diferencia = val - media;
      return acc + diferencia * diferencia;
    }, 0);

    return Math.sqrt(sumaDiferenciasCuadradas / valores.length);
  }
}
