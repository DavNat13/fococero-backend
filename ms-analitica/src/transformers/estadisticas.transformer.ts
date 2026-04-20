export class EstadisticasTransformer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static extraerKpis(datos: any[]) {
    return {
      total: datos.reduce((acc, curr) => acc + curr.total_incidentes, 0),
      promedioRespuesta:
        datos.reduce((acc, curr) => acc + curr.prom_respuesta_seg, 0) /
        (datos.length || 1),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static extraerTendencias(datos: any[]) {
    return datos.map((d) => ({ x: d.fecha, y: d.total_incidentes }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static extraerDistribucion(datos: any[]) {
    const map: Record<string, number> = {};
    datos.forEach((d) => {
      map[d.categoria] = (map[d.categoria] || 0) + d.total_incidentes;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }
}
