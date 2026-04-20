import { Request, Response } from "express";
import { espacialService } from "../services/espacial.service";
import {
  HeatmapQuerySchema,
  GeoHashQuerySchema,
  RadioQuerySchema,
} from "../validators/analitica.validator";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class EspacialController {
  public obtenerHeatmap = catchAsync(async (req: Request, res: Response) => {
    const params = HeatmapQuerySchema.parse(req.query);
    const data = await espacialService.generarMapaCalor(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "GeoJSON de mapa de calor generado",
        ),
      );
  });

  public obtenerDetalleCuadrante = catchAsync(
    async (req: Request, res: Response) => {
      const params = GeoHashQuerySchema.parse(req.query);
      const data = await espacialService.obtenerDetallePorGeohash(params);

      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(data, "Detalle espacial recuperado"),
        );
    },
  );

  public obtenerPorRadio = catchAsync(async (req: Request, res: Response) => {
    const params = RadioQuerySchema.parse(req.query);
    const data = await espacialService.obtenerIncidentesPorRadio(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "Análisis de proximidad completado",
        ),
      );
  });
}

export const espacialController = new EspacialController();
