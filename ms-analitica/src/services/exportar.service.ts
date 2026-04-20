import { analiticaRepository } from "../repositories/analitica.repository";
import { TStatsQuery } from "../validators/analitica.validator";

export class ExportarService {
  public async generarReporteCsv(
    params: TStatsQuery,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const datosDb = await analiticaRepository.obtenerEstadisticasBase(params);

    if (datosDb.length === 0) {
      throw new Error("No hay datos disponibles para el rango seleccionado");
    }

    const cabeceras = Object.keys(datosDb[0]).join(",");
    const filas = datosDb.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csvString = [cabeceras, ...filas].join("\n");
    const buffer = Buffer.from("\uFEFF" + csvString, "utf8");

    const timestamp = new Date().toISOString().split("T")[0];

    return {
      buffer,
      filename: `fococero_export_${timestamp}.csv`,
    };
  }

  public async generarReportePdf(
    _params: TStatsQuery, 
  ): Promise<{ buffer: Buffer; filename: string }> {
    const timestamp = new Date().toISOString().split("T")[0];

    const pdfSimulado = Buffer.from(
      "%PDF-1.4\n%Reporte Gerencial FocoCero\n",
      "utf8",
    );

    return {
      buffer: pdfSimulado,
      filename: `fococero_reporte_${timestamp}.pdf`,
    };
  }
}

export const exportarService = new ExportarService();
