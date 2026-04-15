import { Request, Response } from "express";
import { healthService } from "../services/health.service";
import { mantenimientoService } from "../services/mantenimiento.service";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class OpsController {
  public checkHealth = catchAsync(async (req: Request, res: Response) => {
    const data = await healthService.check();
    const statusCode = data.status === "OK" ? 200 : 503;

    res.status(statusCode).json(data);
  });

  public getMetrics = catchAsync(async (req: Request, res: Response) => {
    const metrics = await healthService.getMetrics();
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(metrics);
  });

  public forzarMantenimiento = catchAsync(
    async (req: Request, res: Response) => {
      await mantenimientoService.sincronizarDatosBase();

      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(
            null,
            "Sincronización de vistas materializadas completada",
          ),
        );
    },
  );

  public purgarCache = catchAsync(async (req: Request, res: Response) => {
    await mantenimientoService.purgarCaches();

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          null,
          "Limpieza de caché global completada exitosamente",
        ),
      );
  });
}

export const opsController = new OpsController();
