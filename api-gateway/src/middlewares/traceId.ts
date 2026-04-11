import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// 🛡️ Escudo: Solo UUIDs o identificadores alfanuméricos seguros
const safeIdRegex = /^[a-zA-Z0-9-]{10,50}$/;

export const traceIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const incomingId = req.headers["x-trace-id"] as string;

  // Si envían un ID malicioso o inexistente, generamos un UUIDv4 limpio
  const traceId =
    incomingId && safeIdRegex.test(incomingId) ? incomingId : randomUUID();

  // Inyectamos el rastro seguro hacia adelante (microservicios) y hacia atrás (frontend)
  req.headers["x-trace-id"] = traceId;
  res.setHeader("x-trace-id", traceId);

  next();
};
