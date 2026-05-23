import { analiticaRepository } from "../repositories/analitica.repository";
import { TStatsQuery } from "../validators/analitica.validator";

interface IPuntoPronostico {
  fecha: string;
  incidentes_estimados: number;
  margen_error_positivo: number;
  margen_error_negativo: number;
}

class PredictivaService {
  private readonly DIAS_PROYECCION = 7;
  private readonly PERIODO_VENTANA_MMS = 14;

  public async generarPronostico(
    params: TStatsQuery,
  ): Promise<IPuntoPronostico[]> {
    const datosHistoricos = await analiticaRepository.obtenerSerieTiempoDiaria(
      params.startDate,
      params.endDate,
    );

    if (datosHistoricos.length < this.PERIODO_VENTANA_MMS) {
      throw new Error(
        "Datos históricos insuficientes para calcular un pronóstico estadísticamente válido.",
      );
    }

    const pronostico: IPuntoPronostico[] = [];
    const valores = datosHistoricos.map((d) => Number(d.total_incidentes) || 0);

    const ultimaFecha = new Date(
      datosHistoricos[datosHistoricos.length - 1].fecha_sk,
    );

    for (let i = 0; i < this.DIAS_PROYECCION; i++) {
      const ventana = valores.slice(-this.PERIODO_VENTANA_MMS);
      const promedio =
        ventana.reduce((a, b) => a + b, 0) / this.PERIODO_VENTANA_MMS;

      const varianza =
        ventana.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) /
        this.PERIODO_VENTANA_MMS;
      const desviacionEstandar = Math.sqrt(varianza);

      valores.push(promedio);
      ultimaFecha.setDate(ultimaFecha.getDate() + 1);

      pronostico.push({
        fecha: ultimaFecha.toISOString().split("T")[0],
        incidentes_estimados: Math.round(promedio),
        margen_error_positivo: Math.round(promedio + desviacionEstandar),
        margen_error_negativo: Math.max(
          0,
          Math.round(promedio - desviacionEstandar),
        ),
      });
    }

    return pronostico;
  }
}

export const predictivaService = new PredictivaService();
