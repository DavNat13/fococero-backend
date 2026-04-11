import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  standardHeaders: true, // Retorna límite actual en los headers (RateLimit-*)
  legacyHeaders: false, // Deshabilita headers viejos (X-RateLimit-*)
  message: {
    success: false,
    message:
      "🚨 Bloqueo Automático: Tráfico inusual detectado desde su origen. Por favor, espere 15 minutos.",
  },
  // 🛡️ Escudo: Ignoramos healthchecks para evitar que el orquestador (Docker/K8s) mate el contenedor
  skip: (req) => req.path === "/health" || req.path === "/api/health",
});
