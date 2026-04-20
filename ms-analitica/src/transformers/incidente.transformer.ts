// src/transformers/incidente.transformer.ts

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  IFactIncidente,
  IncidentId,
  GeoHashStr,
} from "../models/fact-incidente.model";

export const RawIncidenteSchema = z.object({
  idExterno: z.string().optional(),
  origen: z.string(),
  tipo: z.string(),
  nivelUrgencia: z.union([z.number(), z.string()]).optional(),
  ubicacion: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  timestamps: z.object({
    creadoEn: z.union([z.string(), z.date()]),
    resueltoEn: z.union([z.string(), z.date()]).optional(),
  }),
  detallesAdicionales: z.record(z.string(), z.unknown()).optional(),
});

export class IncidenteTransformer {
  private static mapearSeveridad(
    urgencia: number | string | undefined,
  ): "ALTA" | "MEDIA" | "BAJA" {
    const nivel = Number(urgencia);
    if (Number.isNaN(nivel)) return "MEDIA";
    if (nivel >= 4) return "ALTA";
    if (nivel <= 2) return "BAJA";
    return "MEDIA";
  }

  private static calcularTiempoRespuesta(
    inicio: string | Date,
    fin?: string | Date,
  ): number | null {
    if (!fin) return null;
    const ms = new Date(fin).getTime() - new Date(inicio).getTime();
    return ms > 0 ? Math.floor(ms / 1000) : null;
  }

  public static aFactIncidente(rawPayload: unknown): IFactIncidente {
    const raw = RawIncidenteSchema.parse(rawPayload);
    const fechaOcurrencia = new Date(raw.timestamps.creadoEn);

    return {
      id: uuidv4() as unknown as IncidentId,
      fecha_sk: fechaOcurrencia.toISOString().split("T")[0],
      origen: raw.origen.toUpperCase().trim(),
      categoria: raw.tipo.toUpperCase().trim(),
      severidad: this.mapearSeveridad(raw.nivelUrgencia),
      latitud: raw.ubicacion.lat,
      longitud: raw.ubicacion.lng,
      geom: "",
      geohash: "" as unknown as GeoHashStr,
      tiempo_respuesta_segundos: this.calcularTiempoRespuesta(
        raw.timestamps.creadoEn,
        raw.timestamps.resueltoEn,
      ),
      fecha_ocurrencia: fechaOcurrencia,
      metadata: {
        id_externo: raw.idExterno || null,
        ...raw.detallesAdicionales,
      },
      created_at: new Date(),
    };
  }

  public static aFactIncidenteBatch(rawPayloads: unknown[]): IFactIncidente[] {
    return rawPayloads.map((payload) => this.aFactIncidente(payload));
  }
}
