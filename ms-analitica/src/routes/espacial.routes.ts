import { Router } from "express";
import { espacialController } from "../controllers/espacial.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(AuthMiddleware.validateInternalToken);
router.use(RateLimitMiddleware.limit);

router.get("/heatmap", espacialController.obtenerHeatmap);
router.get("/detalle", espacialController.obtenerDetalleCuadrante);
router.get("/radio", espacialController.obtenerPorRadio);

export const espacialRoutes = router;
