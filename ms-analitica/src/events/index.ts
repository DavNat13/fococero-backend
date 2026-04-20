import { IncidenteConsumer } from "./incidente.consumer";
import { DlqConsumer } from "./dlq.consumer";

export class EventRegistry {
  public static async inicializarTodos(): Promise<void> {
    await IncidenteConsumer.inicializar();
    await DlqConsumer.inicializar();
  }
}
