// api-gateway/src/routes/routes.ts

import { Router, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { envs } from "../config/envs";
import { logger } from "../config/logger";
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
      // 1. Trazabilidad: Propagamos el Trace ID como Correlation ID para los microservicios
      const traceId = req.headers["x-trace-id"];
      if (traceId) {
        const id = Array.isArray(traceId) ? traceId[0] : traceId;
        proxyReq.setHeader("x-trace-id", id);
        proxyReq.setHeader("x-correlation-id", id);
      }

      // 🛡️ 2. Seguridad Zero-Trust: Inyectamos el token interno automáticamente.
      // Esto permite que los MS validen que la petición viene del Gateway.
      proxyReq.setHeader("x-internal-token", envs.INTERNAL_SECRET_TOKEN);
    },

    error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
      const traceId = req.headers["x-trace-id"] || "N/A";
      logger.error(
        `🚨 [Proxy Error | Trace: ${traceId}] No se pudo alcanzar: ${target} - ${err.message}`,
      );

      if ("writeHead" in res) {
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message:
                "El servicio solicitado está temporalmente fuera de línea.",
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
 * 📊 ANALITICA SERVICE (Capa de Inteligencia)
 * Requiere token verificado debido a que maneja datos sensibles de riesgo.
 */
appRoutes.use(
  "/api/analitica",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.ANALITICA_SERVICE_URL)),
);

/**
 * 🗺️ GEO SERVICE
 */
appRoutes.use(
  "/api/geo",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.GEO_SERVICE_URL)),
);

/**
 * 📱 REPORTES SERVICE
 */
appRoutes.use(
  "/api/reportes",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.REPORTES_SERVICE_URL)),
);

/**
 * 🖼️ MULTIMEDIA SERVICE
 * Requiere token verificado para gestión de archivos.
 */
appRoutes.use(
  "/api/multimedia",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.MULTIMEDIA_SERVICE_URL)),
);

/**
 * ⚠️ ALERTAS SERVICE
 */
appRoutes.use(
  "/api/alertas",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(getProxyOptions(envs.ALERTAS_SERVICE_URL)),
);

/**
 * 🚒 EMERGENCIAS SERVICE
 * Orquestación de despacho a organismos.
 */
appRoutes.use(
  "/api/emergencias",
  traceIdMiddleware,
  verifyToken, // Solo personal autorizado/autenticado puede disparar despachos
  createProxyMiddleware(getProxyOptions(envs.EMERGENCIAS_SERVICE_URL)),
);
