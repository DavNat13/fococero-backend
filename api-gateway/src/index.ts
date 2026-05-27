// api-gateway/src/index.ts

import "./config/firebase";
import { envs } from "./config/envs";
import { logger } from "./config/logger";
import app from "./app";

// --- Adaptador de Eureka ---
import { initEurekaClient } from "./config/eureka.client";

// ============================================================================
// 🚀 INICIO DEL SERVIDOR Y APAGADO ELEGANTE
// ============================================================================
const server = app.listen(envs.PORT, () => {
  logger.info(`====================================================`);
  logger.info(`🚀 FOCOCERO API GATEWAY ACTIVADO`);
  logger.info(`📡 Puerto: ${envs.PORT} | Entorno: ${envs.NODE_ENV}`);
  logger.info(`🛡️  Seguridad: CORS estricto, Helmet y Limitadores activos.`);
  logger.info(
    `📖 Documentación unificada: http://localhost:${envs.PORT}/api/docs`,
  );
  logger.info(`====================================================`);

  initEurekaClient("api-gateway", envs.PORT);
});

const shutdown = (signal: string) => {
  logger.info(
    `🛑 Recibida señal ${signal}. Cerrando Gateway para no cortar tráfico...`,
  );
  server.close(() => {
    logger.info("✅ Gateway cerrado correctamente. ¡Adiós!");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("⚠️ Forzando apagado del Gateway tras 10s.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
