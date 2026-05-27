import morgan from "morgan";
import pino from "pino";

// NOTA: No importamos { envs } desde "./envs" para evitar dependencia circular.
// Usamos process.env directamente, que ya ha sido poblado por dotenv en envs.ts.

// Formato estructurado para sistemas de logs (Datadog, CloudWatch, ELK)
const jsonFormat = (tokens: any, req: any, res: any) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    responseTime: `${tokens["response-time"](req, res)}ms`,
    ip: tokens["remote-addr"](req, res),
    userAgent: tokens["user-agent"](req, res),
    traceId: req.headers["x-trace-id"] || "N/A",
  });
};

const nodeEnv = process.env.NODE_ENV || "development";

export const morganLogger =
  nodeEnv === "production" ? morgan(jsonFormat) : morgan("dev");

export const logger = pino({
  level: nodeEnv === "test" ? "silent" : "info",
});
