import pino from "pino";

const pinoInstance = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

function formatError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export const logger = {
  info: (msg: string, meta?: unknown) => pinoInstance.info(meta ?? {}, msg),
  error: (msg: string, err?: unknown) =>
    pinoInstance.error(err ?? {}, `${msg} ${err ? formatError(err) : ""}`),
  warn: (msg: string, meta?: unknown) => pinoInstance.warn(meta ?? {}, msg),
  debug: (msg: string, meta?: unknown) => pinoInstance.debug(meta ?? {}, msg),
};
