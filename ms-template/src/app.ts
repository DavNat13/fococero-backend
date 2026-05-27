// ms-template/src/app.ts
// Express app extracted from index.ts for testability

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { envs } from './config/envs';
import router from './routes/index.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app: Application = express();

// --- 🛡️ SEGURIDAD PERIMETRAL ---
app.use(helmet());
app.use(cors()); // En microservicios internos, el API Gateway maneja la seguridad
app.use(express.json());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Demasiadas peticiones desde esta IP.' },
});

// --- 🚦 RUTAS ---
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', service: 'ms-template' });
});

app.use('/api/v1', apiLimiter, router);
app.use(errorHandler);
app.use(notFoundHandler);

export default app;
