import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { envs } from './config/envs';
import { correlationMiddleware } from './middlewares/correlation.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { timeoutMiddleware } from './middlewares/timeout.middleware';
import { internalAuthMiddleware } from './middlewares/internalAuth.middleware';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics.middleware';
import routes from './routes';
import { globalErrorHandler } from './helpers/globalErrorHandler';
import { AppError } from './helpers/AppError';
import { HealthController } from './controllers/health.controller';

const app: Application = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
            },
        },
    }),
);
app.use(cors({ origin: envs.API_GATEWAY_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(correlationMiddleware);
app.use(requestLogger);
app.use(timeoutMiddleware);

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

// Endpoint de métricas Prometheus
app.get('/metrics', metricsHandler);

// Endpoint de salud público (Antes de la seguridad interna)
app.get('/health', HealthController.check);

// Seguridad interna para el resto de las rutas
app.use(internalAuthMiddleware);

app.use('/api/v1/emergencias', routes);

app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`No se encontró la ruta: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
