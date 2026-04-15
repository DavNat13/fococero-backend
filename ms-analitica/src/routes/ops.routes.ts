import { Router } from "express";
import { opsController } from "../controllers/ops.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);

router.get("/health", opsController.checkHealth);
router.get("/metrics", opsController.getMetrics);

router.post(
  "/mantenimiento/sincronizar",
  AuthMiddleware.validateInternalToken,
  opsController.forzarMantenimiento,
);
router.post(
  "/cache/purgar",
  AuthMiddleware.validateInternalToken,
  opsController.purgarCache,
);

export const opsRoutes = router;
