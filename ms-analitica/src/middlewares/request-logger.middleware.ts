import { Request, Response, NextFunction } from "express";
import { Logger } from "../helpers/logger.helper";

export class RequestLoggerMiddleware {
  public static log(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`;

      if (res.statusCode >= 500) {
        Logger.error(message, { ip: req.ip, body: req.body });
      } else if (res.statusCode >= 400) {
        Logger.warn(message, { ip: req.ip });
      } else {
        Logger.info(message, { ip: req.ip });
      }
    });

    next();
  }
}
