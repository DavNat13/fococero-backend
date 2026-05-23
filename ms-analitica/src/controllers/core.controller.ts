import { Request, Response } from 'express';
import { coreService } from '../services/core.service';
import { StatsQuerySchema } from '../validators/analitica.validator';
import { RespuestaHttpTransformer } from '../transformers/respuesta-http.transformer';
import { catchAsync } from '../helpers/catch-async.helper';

export class CoreController {
    /**
     * Obtiene los indicadores clave de desempeño (KPIs)
     * Endpoint: GET /api/v1/analitica/core/kpis
     */
    public obtenerKpis = catchAsync(async (req: Request, res: Response) => {
        // 1. Validación y transformación de Query Params vía Zod
        const params = StatsQuerySchema.parse(req.query);
        
        // 2. Delegación al servicio especializado
        const data = await coreService.calcularKpis(params);
        
        // 3. Respuesta estandarizada
        res.status(200).json(
            RespuestaHttpTransformer.exito(data, 'KPIs calculados exitosamente')
        );
    });

    /**
     * Obtiene las series de tiempo para gráficos de tendencias
     * Endpoint: GET /api/v1/analitica/core/tendencias
     */
    public obtenerTendencias = catchAsync(async (req: Request, res: Response) => {
        const params = StatsQuerySchema.parse(req.query);
        const data = await coreService.calcularTendencias(params);
        
        res.status(200).json(
            RespuestaHttpTransformer.exito(data, 'Serie de tiempo de tendencias generada')
        );
    });

    /**
     * Obtiene la distribución de incidentes por categorías
     * Endpoint: GET /api/v1/analitica/core/distribucion
     */
    public obtenerDistribucion = catchAsync(async (req: Request, res: Response) => {
        const params = StatsQuerySchema.parse(req.query);
        const data = await coreService.calcularDistribucion(params);
        
        res.status(200).json(
            RespuestaHttpTransformer.exito(data, 'Distribución por categorías procesada')
        );
    });

    /**
     * Ejecuta el motor de detección de anomalías estadísticas
     * Endpoint: GET /api/v1/analitica/core/anomalias
     */
    public obtenerAnomalias = catchAsync(async (req: Request, res: Response) => {
        const params = StatsQuerySchema.parse(req.query);
        const data = await coreService.detectarAnomalias(params);
        
        res.status(200).json(
            RespuestaHttpTransformer.exito(data, 'Análisis de detección de anomalías completado')
        );
    });
}

// Exportamos la instancia lista para ser usada en las rutas
export const coreController = new CoreController();