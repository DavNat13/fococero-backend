import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  limit: 100, // Límite de 100 peticiones por IP
  standardHeaders: "draft-7", // Retorna límite actual en los headers
  legacyHeaders: false, // Reduce el tamaño de la respuesta deshabilitando headers viejos
  message: {
    success: false,
    message:
      "🚨 Bloqueo Automático: Tráfico inusual detectado desde su origen. Por favor, espere 15 minutos.",
  },
  // Escudo: Ignoramos las peticiones de salud (healthcheck) para que AWS/Docker no crean que el servidor murió
  skip: (req) => req.path === "/health",
});
