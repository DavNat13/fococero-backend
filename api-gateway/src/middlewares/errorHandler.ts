import { Request, Response, NextFunction } from "express";
import { envs } from "../config/envs";
import { logger } from "../config/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // Express requiere que existan los 4 argumentos para identificarlo como Error Middleware
  _next: NextFunction,
) => {
  const statusCode = err.status || err.statusCode || 500;

  // 🛡️ Escudo: Sanitizamos la URL antes de imprimirla para evitar inyección de logs
  const safeUrl = encodeURI(req.originalUrl);
  const traceId = req.headers["x-trace-id"] || "N/A";

  // Log interno con Trace ID para depuración rápida
  logger.error(
    `❌ [Gateway Error | Trace: ${traceId}] ${req.method} ${safeUrl} - ${err.message}`,
  );

  res.status(statusCode).json({
    success: false,
    message: "Error de comunicación en la red perimetral (Gateway)",
    error:
      envs.NODE_ENV === "development" ? err.message : "Internal Server Error",
    traceId: traceId,
  });
};
