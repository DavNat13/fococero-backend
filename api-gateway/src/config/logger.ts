import morgan from "morgan";
import { envs } from "./envs";

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

export const morganLogger =
  envs.NODE_ENV === "production" ? morgan(jsonFormat) : morgan("dev");
