// src/helpers/logger.helper.ts
import pino from "pino";

const pinoLogger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export class Logger {
  public static info(message: string, meta?: unknown): void {
    pinoLogger.info(meta, message);
  }

  public static warn(message: string, meta?: unknown): void {
    pinoLogger.warn(meta, message);
  }

  public static error(message: string, meta?: unknown): void {
    pinoLogger.error(meta, message);
  }

  public static debug(message: string, meta?: unknown): void {
    pinoLogger.debug(meta, message);
  }
}
