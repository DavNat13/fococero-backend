import { Router } from "express";
import { predictivaController } from "../controllers/predictiva.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(AuthMiddleware.validateInternalToken);
router.use(RateLimitMiddleware.limit);

router.get("/forecast", predictivaController.obtenerPronostico);

export const predictivaRoutes = router;
