import { MantenimientoJob } from "./mantenimiento.job";
import { AnomaliasJob } from "./anomalias.job";

export class JobRegistry {
  public static iniciarTodos(): void {
    MantenimientoJob.iniciar();
    AnomaliasJob.iniciar();
  }
}
