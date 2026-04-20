import { Request, Response } from "express";
import { filtrosService } from "../services/filtros.service";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class FiltrosController {
  public obtenerCategorias = catchAsync(async (req: Request, res: Response) => {
    const data = await filtrosService.listarCategorias();
    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "Filtros de categoría recuperados",
        ),
      );
  });

  public obtenerOrigenes = catchAsync(async (req: Request, res: Response) => {
    const data = await filtrosService.listarOrigenes();
    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(data, "Filtros de origen recuperados"),
      );
  });

  public obtenerSeveridades = catchAsync(
    async (req: Request, res: Response) => {
      const data = await filtrosService.listarSeveridades();
      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(
            data,
            "Filtros de severidad recuperados",
          ),
        );
    },
  );
}

export const filtrosController = new FiltrosController();
