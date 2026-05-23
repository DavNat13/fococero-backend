import { redisCache } from "../config/redis";

export class RedisMutex {
  private static readonly LOCK_PREFIX = "lock:";
  private static readonly DEFAULT_RETRY_DELAY_MS = 50;
  private static readonly MAX_RETRIES = 100;

  public static async adquirirBloqueo(
    recursoId: string,
    ttlSegundos: number = 10,
  ): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
    const client = redisCache["client"];

    const lockAcquired = await client.set(lockKey, "LOCKED", {
      NX: true,
      EX: ttlSegundos,
    });

    return lockAcquired !== null;
  }

  public static async liberarBloqueo(recursoId: string): Promise<void> {
    const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
    const client = redisCache["client"];
    await client.del(lockKey);
  }

  public static async esperarBloqueo(recursoId: string): Promise<void> {
    let intentos = 0;

    while (intentos < this.MAX_RETRIES) {
      const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
      const client = redisCache["client"];
      const estaBloqueado = await client.get(lockKey);

      if (!estaBloqueado) {
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, this.DEFAULT_RETRY_DELAY_MS),
      );
      intentos++;
    }

    throw new Error(
      `Timeout esperando liberación del candado para el recurso: ${recursoId}`,
    );
  }
}
