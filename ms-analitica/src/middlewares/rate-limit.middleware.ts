import { Request, Response, NextFunction } from "express";
import { redisCache } from "../config/redis";
import { AppError } from "../helpers/error.helper";

export class RateLimitMiddleware {
  private static readonly WINDOW_SECS = 60;
  private static readonly MAX_REQUESTS = 30;

  public static async limit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const client = redisCache["client"];
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const key = `ratelimit:${ip}`;

      const requests = await client.incr(key);

      if (requests === 1) {
        await client.expire(key, this.WINDOW_SECS);
      }

      res.setHeader("X-RateLimit-Limit", this.MAX_REQUESTS);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, this.MAX_REQUESTS - requests),
      );

      if (requests > this.MAX_REQUESTS) {
        throw new AppError(
          "Límite de peticiones excedido. Intente nuevamente en un minuto.",
          429,
          "ERR_TOO_MANY_REQUESTS",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
