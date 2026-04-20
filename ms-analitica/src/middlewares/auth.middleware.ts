import { Request, Response, NextFunction } from "express";
import { envs } from "../config/envs";
import { UnauthorizedError } from "../helpers/error.helper";
import { Logger } from "../helpers/logger.helper";

export class AuthMiddleware {
  public static validateInternalToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      const authHeader =
        req.headers["authorization"] || req.headers["x-internal-token"];

      if (!authHeader) {
        throw new UnauthorizedError(
          "Token de comunicación interna no proporcionado.",
        );
      }

      const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const extractedToken = token.startsWith("Bearer ")
        ? token.slice(7)
        : token;

      if (extractedToken !== envs.INTERNAL_SECRET_TOKEN) {
        Logger.warn("Intento de acceso fallido con token interno inválido", {
          ip: req.ip,
          path: req.originalUrl,
        });
        throw new UnauthorizedError();
      }

      req.internalToken = extractedToken;
      next();
    } catch (error) {
      next(error);
    }
  }
}
