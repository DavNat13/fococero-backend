import morgan from "morgan";
import { envs } from "./envs";

// Formato JSON personalizado para Producción (Fácil de leer para Datadog/CloudWatch)
const jsonFormat = (tokens: any, req: any, res: any) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    response_time_ms: Number(tokens["response-time"](req, res)),
    ip: tokens["remote-addr"](req, res),
    timestamp: new Date().toISOString(),
  });
};

// Exportamos el middleware de Morgan ya pre-configurado
export const morganLogger =
  envs.NODE_ENV === "production" ? morgan(jsonFormat) : morgan("dev");
