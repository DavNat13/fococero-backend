import { Logger } from "../helpers/logger.helper";

export class AlertaService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async notificarAnomaliaCritica(anomalias: any[]): Promise<void> {
    const criticas = anomalias.filter((a) => a.esCritica);

    if (criticas.length === 0) return;

    Logger.warn(
      `🚨 [ALERTAS] Se han detectado ${criticas.length} anomalías críticas en el sistema.`,
      {
        detalles: criticas.map((a) => ({
          fecha: a.fecha,
          categoria: a.categoria,
        })),
      },
    );
  }
}

export const alertaService = new AlertaService();
