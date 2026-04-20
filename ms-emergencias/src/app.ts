import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { correlationMiddleware } from './middlewares/correlation.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { timeoutMiddleware } from './middlewares/timeout.middleware';
import { internalAuthMiddleware } from './middlewares/internalAuth.middleware';
import routes from './routes';
import { globalErrorHandler } from './helpers/globalErrorHandler';
import { AppError } from './helpers/AppError';
import { HealthController } from './controllers/health.controller';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(correlationMiddleware);
app.use(requestLogger);
app.use(timeoutMiddleware);

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
