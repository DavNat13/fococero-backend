// Branded types para seguridad de dominio
export type IncidentId = string & { readonly __brand: "IncidentId" };
export type GeoHashStr = string & { readonly __brand: "GeoHash" };

export interface IFactIncidente {
  id: IncidentId;
  fecha_sk: string;
  origen: string;
  categoria: string;
  severidad: "ALTA" | "MEDIA" | "BAJA";
  latitud: number;
  longitud: number;
  geom: string;
  geohash: GeoHashStr;
  tiempo_respuesta_segundos: number | null;
  fecha_ocurrencia: Date;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface ISerieTiempoDiaria {
  fecha_sk: string;
  total_incidentes: string | number;
}
