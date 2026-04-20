import { rabbitMQBus } from "../config/rabbitmq";

export class DlqConsumer {
  private static readonly DLQ = "analitica.incidentes.dlq";

  public static async inicializar(): Promise<void> {
    const channel = rabbitMQBus.getChannel();

    await channel.assertQueue(this.DLQ, { durable: true });

    await channel.consume(this.DLQ, async (msg) => {
      if (!msg) return;

      try {
        const payload = msg.content.toString();
        const headers = msg.properties.headers || {};
        const reason = headers["x-first-death-reason"] || "UNKNOWN_ERROR";
        const originalQueue = headers["x-first-death-queue"] || "UNKNOWN_QUEUE";

        process.stderr.write(
          `[CRÍTICO - DLQ] Mensaje fallido drenado.\n` +
            `Cola original: ${originalQueue}\n` +
            `Razón: ${reason}\n` +
            `Payload: ${payload}\n`,
        );

        channel.ack(msg);
      } catch (error) {
        process.stderr.write(
          `[FATAL] Fallo al procesar mensaje de DLQ. Reencolando... Error: ${
            error instanceof Error ? error.message : String(error)
          }\n`,
        );
        channel.nack(msg, false, true);
      }
    });
  }
}
