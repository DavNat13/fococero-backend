// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { AppError } from "../helpers/error.helper";
import { Logger } from "../helpers/logger.helper";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";

export class ErrorMiddleware {
  public static handle(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (error instanceof AppError) {
      if (!error.isOperational) {
        Logger.error("Error de programación crítico", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        process.exit(1);
      }

      Logger.warn(`Error operacional: ${error.message}`, { code: error.code });

      const response = RespuestaHttpTransformer.error(
        error.message,
        error.code,
      );
      res.status(error.statusCode).json(response);
      return;
    }

    if (error instanceof ZodError) {
      const detalles = error.issues.map((e: ZodIssue) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      }));

      Logger.warn("Error de validación de esquema", detalles);

      const response = RespuestaHttpTransformer.error(
        "Datos de entrada inválidos",
        "ERR_VALIDATION",
        detalles,
      );
      res.status(400).json(response);
      return;
    }

    Logger.error("Error interno no controlado", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
    });

    const response = RespuestaHttpTransformer.error(
      "Error interno del servidor",
      "ERR_INTERNAL_SERVER_ERROR",
    );

    res.status(500).json(response);
  }
}
