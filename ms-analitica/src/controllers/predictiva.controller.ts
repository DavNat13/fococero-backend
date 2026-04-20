import { Request, Response } from "express";
import { predictivaService } from "../services/predictiva.service";
import { StatsQuerySchema } from "../validators/analitica.validator";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class PredictivaController {
  public obtenerPronostico = catchAsync(async (req: Request, res: Response) => {
    const params = StatsQuerySchema.parse(req.query);
    const data = await predictivaService.generarPronostico(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(data, "Pronóstico predictivo generado"),
      );
  });
}

export const predictivaController = new PredictivaController();
