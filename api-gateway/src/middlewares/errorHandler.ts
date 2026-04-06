import { Request, Response, NextFunction } from "express";
import { envs } from "../config/envs";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.status || 500;

  // Escudo: Sanitizamos la URL antes de imprimirla para evitar inyección en los logs
  const safeUrl = encodeURI(req.originalUrl);

  console.error(`❌ [Gateway Error] ${req.method} ${safeUrl} - ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: "Error de comunicación en la red perimetral (Gateway)",
    error:
      envs.NODE_ENV === "development" ? err.message : "Internal Server Error",
  });
};
