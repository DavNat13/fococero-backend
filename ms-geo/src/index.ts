// src/index.ts

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---
import { pool, testDbConnection } from './config/database';
import './config/firebase';
import geoRoutes from './routes/geo.routes';
import { errorHandler } from './middlewares/error.middleware';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics.middleware';
import { envs } from './config/envs';
import { logger } from './config/logger';

import { initEurekaClient } from './config/eureka.client';

const app: Application = express();

// Configuración para proxies (Docker/Render/K8s)
app.set('trust proxy', 1);

// ============================================================================
// 📖 1. DOCUMENTACIÓN (SWAGGER)
// ============================================================================
import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// 🛡️ 2. SEGURIDAD Y MIDDLEWARES BASE
// ============================================================================
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

// Limitador: Protege al motor espacial de abusos (100 peticiones / 15 min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Demasiadas peticiones al radar. Intente más tarde.' },
});
app.use('/api/geo', limiter);

// ============================================================================
// 🛣️ 3. RUTAS Y ERRORES
// ============================================================================
// 📊 Endpoint de métricas Prometheus
app.get('/metrics', metricsHandler);

app.use('/api/geo', geoRoutes);

// Manejador global (Debe ser el último middleware)
app.use(errorHandler);

// ============================================================================
// 🚀 4. LANZAMIENTO
// ============================================================================
const PORT = envs.PORT;

const server = app.listen(PORT, async () => {
    logger.info(`====================================================`);
    logger.info(`🌍 MICROSERVICIO MS-GEO (FocoCero) ACTIVADO`);
    logger.info(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);

    // Verificación de salud de PostGIS
    await testDbConnection();

    logger.info(`🛡️  Seguridad: Limitador y Escudos Activos`);
    logger.info(`📖 Docs: http://localhost:${PORT}/api/docs`);
    logger.info(`====================================================`);

    initEurekaClient('ms-geo', Number(PORT));
});

// ============================================================================
// 🛑 5. CIERRE CONTROLADO (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Apagando ms-geo (${signal})...`);

    server.close(async () => {
        try {
            await pool.end();
            logger.info('✅ Base de datos desconectada. Sistema cerrado.');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, '❌ Error al cerrar DB');
            process.exit(1);
        }
    });

    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
