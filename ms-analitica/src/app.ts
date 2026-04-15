import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

// Importación de Clases de Middleware
import { RequestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { ErrorMiddleware } from "./middlewares/error.middleware";

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
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Ver logs de peticiones estilo ms-geo

// ============================================================================
// 📊 3. MONITOREO Y TRAZABILIDAD
// ============================================================================
app.use(RequestLoggerMiddleware.log);

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
