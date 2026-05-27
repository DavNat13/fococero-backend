import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { envs } from "./config/envs";

// Importación de Clases de Middleware
import { RequestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { metricsMiddleware, metricsHandler } from "./middlewares/metrics.middleware";

// Helpers, Rutas y Config Docs
import { AppError } from "./helpers/error.helper";
import apiRouter from "./routes/index";
import { swaggerDocument } from "./docs/swagger.config"; // Asegúrate que exporte el JSON/Objeto

const app: Application = express();

// Configuración para proxies (Docker/Load Balancers)
app.set("trust proxy", 1);

// ============================================================================
// 📖 1. DOCUMENTACIÓN (SWAGGER)
// ============================================================================
app.use(
  "/api/v1/analitica/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

// ============================================================================
// 🛡️ 2. SEGURIDAD Y MIDDLEWARES BASE
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
app.use(cors({ origin: envs.API_GATEWAY_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Ver logs de peticiones estilo ms-geo

// ============================================================================
// 📊 3. MONITOREO Y TRAZABILIDAD
// ============================================================================
app.use(RequestLoggerMiddleware.log);

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

// Endpoint de métricas Prometheus
app.get("/metrics", metricsHandler);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "UP",
    service: "ms-analitica",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 🚦 4. RUTAS Y SEGURIDAD INTERNA
// ============================================================================
app.use(AuthMiddleware.validateInternalToken);

// Registro de rutas
app.use("/api/v1/analitica", apiRouter);

// Manejo de rutas no encontradas
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Ruta no encontrada: ${req.originalUrl}`,
      404,
      "ERR_NOT_FOUND",
    ),
  );
});

app.use(ErrorMiddleware.handle);

export default app;
