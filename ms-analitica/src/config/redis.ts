import { createClient } from "redis";
import { envs } from "./envs";
import { Logger } from "../helpers/logger.helper";

class RedisCache {
  private static instance: RedisCache;
  private client: ReturnType<typeof createClient>;

  private constructor() {
    this.client = createClient({
      socket: {
        host: envs.REDIS_HOST,
        port: envs.REDIS_PORT,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    });

    this.client.on("error", (err) => Logger.error("🔴 [Redis] Error:", err));
    this.client.on("ready", () =>
      Logger.info("🟢 Redis [Caché] Conectado Exitosamente"),
    );
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) RedisCache.instance = new RedisCache();
    return RedisCache.instance;
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) await this.client.connect();
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async set(
    key: string,
    value: unknown,
    ttlSeconds = 3600,
  ): Promise<void> {
    await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const redisCache = RedisCache.getInstance();
