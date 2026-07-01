// api-gateway/src/app.ts
// Express app extracted from index.ts for testability

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

// --- Importaciones Internas ---
import { envs } from "./config/envs";
import { corsOptions, corsErrorHandler } from "./config/cors";
import { morganLogger, logger } from "./config/logger";
import { globalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { metricsMiddleware, metricsHandler } from "./middlewares/metrics.middleware";
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
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
            },
        },
    }),
);
app.use(cors(corsOptions));
app.use(compression());
app.use(morganLogger);

// Limitador de fuerza bruta
app.use(globalLimiter);

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

// 📖 Documentación Global (Unificada)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 📊 Endpoint de métricas Prometheus
app.get("/metrics", metricsHandler);

// ============================================================================
// 🚦 ENRUTAMIENTO (Proxy Hacia Microservicios)
// ============================================================================
// NOTA CRÍTICA: No usamos express.json() aquí para no consumir el body antes del proxy.
app.use(appRoutes);

// ============================================================================
// 🚨 GESTIÓN DE ERRORES GLOBALES
// ============================================================================
app.use(corsErrorHandler);
app.use(errorHandler);

export default app;
export { logger };
