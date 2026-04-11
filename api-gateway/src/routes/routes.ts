// api-gateway/src/routes/routes.ts

import { Router, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { envs } from "../config/envs";
import { verifyToken } from "../middlewares/auth.middleware";
import { traceIdMiddleware } from "../middlewares/traceId";

export const appRoutes = Router();

// ============================================================================
// 🏥 HEALTHCHECK (Monitoreo del Gateway)
// ============================================================================
appRoutes.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "FocoCero-Gateway",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 🛠️ CONFIGURACIÓN MAESTRA DEL PROXY
// ============================================================================
const getProxyOptions = (target: string): Options => ({
  target,
  changeOrigin: true,

  on: {
    proxyReq: (
      proxyReq: ClientRequest,
      req: IncomingMessage,
      _res: ServerResponse,
    ) => {
      const traceId = req.headers["x-trace-id"];

      if (traceId) {
        const id = Array.isArray(traceId) ? traceId[0] : traceId;
        proxyReq.setHeader("x-trace-id", id);
      }
    },

    error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
      const traceId = req.headers["x-trace-id"] || "N/A";
      console.error(
        `🚨 [Proxy Error | Trace: ${traceId}] No se pudo alcanzar: ${target} - ${err.message}`,
      );

      if ("writeHead" in res) {
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message:
                "El servicio solicitado está temporalmente fuera de línea o reiniciándose.",
            }),
          );
        }
      }
    },
  },
});

// ============================================================================
// 🚦 TÚNELES DE MICROSERVICIOS
// ============================================================================

/**
 * 🔐 AUTH SERVICE
 */
appRoutes.use(
  "/api/auth",
  traceIdMiddleware,
  createProxyMiddleware(getProxyOptions(envs.AUTH_SERVICE_URL)),
);

/**
 * 🗺️ GEO SERVICE
 */
appRoutes.use(
  "/api/geo",
  traceIdMiddleware,
  createProxyMiddleware(getProxyOptions(envs.GEO_SERVICE_URL)),
);

/**
 * 📱 REPORTES SERVICE
 */
appRoutes.use(
  "/api/reportes",
  traceIdMiddleware,
  createProxyMiddleware(getProxyOptions(envs.REPORTES_SERVICE_URL)),
);

/**
 * ⚠️ ALERTAS SERVICE (100% Privado)
 */
appRoutes.use(
  "/api/alertas",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.ALERTAS_SERVICE_URL)),
);
