import { rabbitMQBus } from "../config/rabbitmq";
import { ingestaService } from "../services/ingesta.service";

export class IncidenteConsumer {
  private static readonly EXCHANGE = "fococero.events";
  private static readonly QUEUE = "analitica.incidentes.queue";
  private static readonly ROUTING_KEY = "incidente.*";
  private static readonly DLX = "fococero.dlx";
  private static readonly DLQ = "analitica.incidentes.dlq";

  public static async inicializar(): Promise<void> {
    const channel = rabbitMQBus.getChannel();

    await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
    await channel.assertExchange(this.DLX, "topic", { durable: true });

    await channel.assertQueue(this.DLQ, { durable: true });
    await channel.bindQueue(this.DLQ, this.DLX, this.ROUTING_KEY);

    await channel.assertQueue(this.QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": this.DLX,
        "x-dead-letter-routing-key": this.ROUTING_KEY,
      },
    });

    await channel.bindQueue(this.QUEUE, this.EXCHANGE, this.ROUTING_KEY);

    await channel.consume(this.QUEUE, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        await ingestaService.procesarEventoIncidente(payload);
        channel.ack(msg);
      } catch (error) {
        console.error("[RabbitMQ] Error en consumidor, enviando a DLQ:", error);
        channel.nack(msg, false, false);
      }
    });
  }
}
