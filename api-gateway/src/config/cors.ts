import { CorsOptions } from "cors";
import { envs } from "./envs";
import { logger } from "./logger";
import type { Request, Response, NextFunction } from "express";

// Lista blanca dinámica basada en envs
const allowedOrigins = envs.CORS_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(
        `🚫 [CORS] Origen bloqueado: "${origin}". Permitidos: ${allowedOrigins.join(", ")}`,
      );
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-trace-id",
    "x-correlation-id",
    "x-internal-token",
  ],
  credentials: true,
  maxAge: 86400,
};

export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err.message.startsWith("🚫 Bloqueado por seguridad (CORS)")) {
    res.status(403).json({
      success: false,
      message:
        "Acceso denegado por política de CORS. El origen no está autorizado.",
    });
    return;
  }
  next(err);
};
