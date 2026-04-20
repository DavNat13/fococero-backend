import { Router } from "express";
import { coreController } from "../controllers/core.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(AuthMiddleware.validateInternalToken);
router.use(RateLimitMiddleware.limit);

router.get("/kpis", coreController.obtenerKpis);
router.get("/tendencias", coreController.obtenerTendencias);
router.get("/distribucion", coreController.obtenerDistribucion);
router.get("/anomalias", coreController.obtenerAnomalias);

export const coreRoutes = router;
