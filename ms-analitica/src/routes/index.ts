import { Router } from "express";
import { opsRoutes } from "./ops.routes";
import { coreRoutes } from "./core.routes";
import { espacialRoutes } from "./espacial.routes";
import { filtrosRoutes } from "./filtros.routes";
import { exportarRoutes } from "./exportar.routes";
import { predictivaRoutes } from "./predictiva.routes";

const apiRouter = Router();

apiRouter.use("/ops", opsRoutes);
apiRouter.use("/core", coreRoutes);
apiRouter.use("/espacial", espacialRoutes);
apiRouter.use("/filtros", filtrosRoutes);
apiRouter.use("/exportar", exportarRoutes);
apiRouter.use("/predictiva", predictivaRoutes);

export default apiRouter;
