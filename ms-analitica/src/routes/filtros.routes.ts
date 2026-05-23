import { Router } from "express";
import { filtrosController } from "../controllers/filtros.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(AuthMiddleware.validateInternalToken);

router.get("/categorias", filtrosController.obtenerCategorias);
router.get("/origenes", filtrosController.obtenerOrigenes);
router.get("/severidades", filtrosController.obtenerSeveridades);

export const filtrosRoutes = router;
