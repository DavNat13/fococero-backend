import cron from "node-cron";
import { coreService } from "../services/core.service";
import { alertaService } from "../services/alerta.service";
import { Logger } from "../helpers/logger.helper";

export class AnomaliasJob {
  public static iniciar(): void {
    cron.schedule("0 * * * *", async () => {
      try {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);

        const anomalias = await coreService.detectarAnomalias({
          startDate: hace30Dias,
          endDate: hoy,
        });

        await alertaService.notificarAnomaliaCritica(anomalias);
      } catch (error) {
        Logger.error("[CRON ERROR] Fallo en motor de anomalías", { error });
      }
    });
  }
}
