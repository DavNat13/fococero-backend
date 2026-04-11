// api-gateway/src/index.ts

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

// --- Importaciones Internas ---
import "./config/firebase";
import { envs } from "./config/envs";
import { corsOptions } from "./config/cors";
import { morganLogger } from "./config/logger";
import { globalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { appRoutes } from "./routes/routes";
import { swaggerDocument } from "./docs/swagger";

const app: Application = express();

/**
 * 🛡️ CONFIGURACIÓN DE PROXY DE RED
 * Vital para que el Rate Limiter reconozca las IPs reales detrás de Docker/AWS.
 */
app.set("trust proxy", 1);

// ============================================================================
// ⚙️ MIDDLEWARES GLOBALES (Rendimiento y Seguridad Perimetral)
// ============================================================================
app.use(helmet());
app.use(cors(corsOptions)); // ✅ Usa la lista blanca estricta
app.use(compression());
app.use(morganLogger); // ✅ Usa logs JSON en producción para Datadog/CloudWatch

// Limitador de fuerza bruta
app.use(globalLimiter);

// 📖 Documentación Global (Unificada)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// 🚦 ENRUTAMIENTO (Proxy Hacia Microservicios)
// ============================================================================
// NOTA CRÍTICA: No usamos express.json() aquí para no consumir el body antes del proxy.
app.use(appRoutes);

// ============================================================================
// 🚨 GESTIÓN DE ERRORES GLOBALES
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🚀 INICIO DEL SERVIDOR Y APAGADO ELEGANTE
// ============================================================================
const server = app.listen(envs.PORT, () => {
  console.log(`\n====================================================`);
  console.log(`🚀 FOCOCERO API GATEWAY ACTIVADO`);
  console.log(`📡 Puerto: ${envs.PORT} | Entorno: ${envs.NODE_ENV}`);
  console.log(`🛡️  Seguridad: CORS estricto, Helmet y Limitadores activos.`);
  console.log(
    `📖 Documentación unificada: http://localhost:${envs.PORT}/api/docs`,
  );
  console.log(`====================================================\n`);
});

const shutdown = (signal: string) => {
  console.log(
    `\n🛑 Recibida señal ${signal}. Cerrando Gateway para no cortar tráfico...`,
  );
  server.close(() => {
    console.log("✅ Gateway cerrado correctamente. ¡Adiós!");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️ Forzando apagado del Gateway tras 10s.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
