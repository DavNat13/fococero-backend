import pino from "pino";
import { envs } from "./envs";

export const logger = pino({
  level: envs.NODE_ENV === "test" ? "silent" : "info",
  transport:
    envs.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
