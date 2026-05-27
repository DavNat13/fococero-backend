import { connect, ChannelModel, Channel } from "amqplib";
import { envs } from "./envs";
import { Logger } from "../helpers/logger.helper";

class RabbitMQBus {
  private static instance: RabbitMQBus; 
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnecting = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQBus {
    if (!RabbitMQBus.instance) {
      RabbitMQBus.instance = new RabbitMQBus();
    }
    return RabbitMQBus.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnecting || (this.connection && this.channel)) return;
    this.isConnecting = true;

    try {
      const conn = await connect(envs.RABBITMQ_URL);
      const ch = await conn.createChannel();

      conn.on("error", (err: unknown) => {
        Logger.error("🔥 [RabbitMQ] Error de conexión:", err);
        this.scheduleReconnect();
      });

      conn.on("close", () => {
        Logger.warn("⚠️ [RabbitMQ] Conexión cerrada. Reconectando...");
        this.scheduleReconnect();
      });

      // Escuchar eventos del canal
      ch.on("error", (err: unknown) => {
        Logger.error("🔥 [RabbitMQ] Error en el canal:", err);
        this.scheduleReconnect();
      });

      ch.on("close", () => {
        Logger.warn("⚠️ [RabbitMQ] Canal cerrado. Reconectando...");
        this.scheduleReconnect();
      });

      // Asignación limpia sin errores de tipado
      this.connection = conn;
      this.channel = ch;

      Logger.info("🐇 RabbitMQ [Event Bus] Conectado Exitosamente");
    } catch (error: unknown) {
      Logger.error("❌ [RabbitMQ] Falla inicial. Reintentando...", error);
      this.scheduleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Ahora TypeScript sabe perfectamente que 'ChannelModel' tiene el método close()
    if (this.connection) {
      this.connection.close().catch(() => {});
    }

    this.connection = null;
    this.channel = null;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch((err: unknown) => {
        Logger.error("Error crítico al reconectar RabbitMQ:", err);
      });
    }, 5000);
  }

  public getChannel(): Channel {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ Channel no inicializado. Llama a connect() primero.",
      );
    }
    return this.channel;
  }
}

export const rabbitMQBus = RabbitMQBus.getInstance();
