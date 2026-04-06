import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Escudo: Solo permitimos caracteres alfanuméricos y guiones, máximo 50 caracteres.
const safeIdRegex = /^[a-zA-Z0-9-]{10,50}$/;

export const traceIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const incomingId = req.headers["x-request-id"] as string;

  // Si envían un ID malicioso o demasiado largo, lo ignoramos y generamos uno limpio
  const traceId =
    incomingId && safeIdRegex.test(incomingId) ? incomingId : randomUUID();

  // Inyectamos el rastro seguro hacia adelante (microservicios) y hacia atrás (frontend)
  req.headers["x-request-id"] = traceId;
  res.setHeader("x-request-id", traceId);

  next();
};
