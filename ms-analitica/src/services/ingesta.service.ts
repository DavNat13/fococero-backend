// src/services/ingesta.service.ts

import { analiticaRepository } from "../repositories/analitica.repository";
import { IncidenteTransformer } from "../transformers/incidente.transformer";
import { IFactIncidente } from "../models/fact-incidente.model";

class IngestaService {
  public async procesarEventoIncidente(rawPayload: unknown): Promise<void> {
    const incidente = IncidenteTransformer.aFactIncidente(rawPayload);

    await analiticaRepository.asegurarDimensionTiempo(
      incidente.fecha_ocurrencia,
    );
    await analiticaRepository.ingestarIncidente(incidente);
  }

  public async procesarLoteIncidentes(rawPayloads: unknown[]): Promise<void> {
    const incidentes: IFactIncidente[] =
      IncidenteTransformer.aFactIncidenteBatch(rawPayloads);

    const fechasUnicas = new Map<string, Date>();
    for (const inc of incidentes) {
      if (!fechasUnicas.has(inc.fecha_sk)) {
        fechasUnicas.set(inc.fecha_sk, inc.fecha_ocurrencia);
      }
    }

    const promesasDimensiones = Array.from(fechasUnicas.values()).map((fecha) =>
      analiticaRepository.asegurarDimensionTiempo(fecha),
    );
    await Promise.all(promesasDimensiones);

    const promesasIngesta = incidentes.map((inc: IFactIncidente) =>
      analiticaRepository.ingestarIncidente(inc),
    );
    await Promise.all(promesasIngesta);
  }
}

export const ingestaService = new IngestaService();
