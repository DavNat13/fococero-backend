// src/helpers/logger.helper.ts
export class Logger {
  private static formatMessage(
    level: string,
    message: string,
    meta?: unknown,
  ): string {
    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (meta !== undefined) {
      payload.meta = meta;
    }

    return JSON.stringify(payload);
  }

  public static info(message: string, meta?: unknown): void {
    process.stdout.write(this.formatMessage("INFO", message, meta) + "\n");
  }

  public static warn(message: string, meta?: unknown): void {
    process.stdout.write(this.formatMessage("WARN", message, meta) + "\n");
  }

  public static error(message: string, meta?: unknown): void {
    process.stderr.write(this.formatMessage("ERROR", message, meta) + "\n");
  }

  public static debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      process.stdout.write(this.formatMessage("DEBUG", message, meta) + "\n");
    }
  }
}
