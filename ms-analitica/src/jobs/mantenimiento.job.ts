import cron from "node-cron";
import { mantenimientoService } from "../services/mantenimiento.service";

export class MantenimientoJob {
  public static iniciar(): void {
    cron.schedule("0 3 * * *", async () => {
      try {
        await mantenimientoService.sincronizarDatosBase();
      } catch (error) {
        process.stderr.write(
          `[CRON ERROR] ${new Date().toISOString()} - ${error instanceof Error ? error.message : String(error)}\n`,
        );
      }
    });
  }
}
