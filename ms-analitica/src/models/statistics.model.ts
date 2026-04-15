export interface IMVEstadisticasDiarias {
  fecha: string;
  es_fin_semana: boolean;
  categoria: string;
  severidad: "ALTA" | "MEDIA" | "BAJA";
  total_incidentes: number;
  prom_respuesta_seg: number;
  mediana_respuesta_seg: number;
}

export interface IAggregatedStats {
  totalIncidentes: number;
  tiempoRespuestaPromedio: number;
  tiempoRespuestaMediana: number;
  distribucionPorCategoria: Record<string, number>;
  distribucionPorSeveridad: Record<string, number>;
  tendenciaDiaria: Array<{
    fecha: string;
    total: number;
  }>;
}
