// api-gateway/src/routes/routes.ts

import { Router } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { envs } from "../config/envs";
import { verifyToken } from "../middlewares/auth.middleware";
import { traceIdMiddleware } from "../middlewares/traceId";

export const appRoutes = Router();

/**
 * 🛠️ CONFIGURACIÓN MAESTRA DEL PROXY
 * @param target URL del microservicio (ej: http://ms-geo:3002)
 * @param pathPrefix El prefijo que Postman usa y que debemos quitar (ej: /api/geo)
 * @param requiresAuth Si el Gateway debe inyectar cabeceras de usuario
 */
const getProxyOptions = (
  target: string,
  pathPrefix: string,
  requiresAuth: boolean,
): Options => ({
  target,
  changeOrigin: true,
  pathRewrite: {
    [`^${pathPrefix}`]: "", // Recorte exacto del prefijo
  },
  on: {
    proxyReq: (proxyReq, req: any) => {
      // 1. Auditoría: Inyectamos el ID de rastreo único
      proxyReq.setHeader("x-request-id", req.headers["x-request-id"] || "");

      // 2. Identidad: Si el Gateway validó el token, pasamos los datos al microservicio
      if (requiresAuth && req.user) {
        proxyReq.setHeader("x-user-id", req.user.id.toString() || "");
        proxyReq.setHeader("x-user-email", req.user.email || "");
        proxyReq.setHeader("x-user-role", req.user.rol || "user");
      }
    },
    error: (err, _req, res: any) => {
      console.error(
        `🔴 [Gateway Proxy Error] en ruteo a ${target}: ${err.message}`,
      );
      res.status(503).json({
        success: false,
        message:
          "Servicio temporalmente fuera de línea. Reintentando conexión...",
      });
    },
  },
});

// ============================================================================
// 🩺 INFRAESTRUCTURA (Público)
// ============================================================================
appRoutes.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "FocoCero-Gateway",
    time: new Date().toISOString(),
  });
});

// ============================================================================
// 🚦 TÚNELES DE MICROSERVICIOS
// ============================================================================

/**
 * 🔐 AUTH SERVICE (Público)
 * El microservicio maneja su propia seguridad interna.
 */
appRoutes.use(
  "/api/auth",
  traceIdMiddleware,
  createProxyMiddleware(
    getProxyOptions(envs.AUTH_SERVICE_URL, "/api/auth", false),
  ),
);

/**
 * 🗺️ GEO SERVICE (Híbrido)
 * IMPORTANTE: Quitamos 'verifyToken' del Gateway para permitir GETs públicos.
 * El microservicio ms-geo decidirá internamente qué rutas proteger.
 */
appRoutes.use(
  "/api/geo",
  traceIdMiddleware,
  createProxyMiddleware(
    getProxyOptions(envs.GEO_SERVICE_URL, "/api/geo", false),
  ),
);

/**
 * ⚠️ ALERTAS SERVICE (Privado)
 * Requiere validación del Gateway antes de siquiera intentar el proxy.
 */
appRoutes.use(
  "/api/alertas",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(
    getProxyOptions(envs.ALERTAS_SERVICE_URL, "/api/alertas", true),
  ),
);

/**
 * 📊 REPORTES SERVICE (Privado)
 */
appRoutes.use(
  "/api/reportes",
  traceIdMiddleware,
  verifyToken,
  createProxyMiddleware(
    getProxyOptions(envs.REPORTES_SERVICE_URL, "/api/reportes", true),
  ),
);
