// ms-reportes/src/index.ts

// ==========================================
// 🚨 ENTRYPOINT: MS-REPORTES (Production-Ready)
// ==========================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---
import { envs } from './config/envs';
import { pool, testDbConnection } from './config/db';
import './config/firebase';
import reporteRoutes from './routes/reporte.routes';
import { errorHandler } from './middlewares/error.middleware';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics.middleware';
import { logger } from './config/logger';

import { initEurekaClient } from './config/eureka.client.js';

const app: Application = express();

app.set('trust proxy', 1);

// 📖 1. DOCUMENTACIÓN (SWAGGER)
import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛡️ 2. SEGURIDAD PERIMETRAL
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

// Nota: Usualmente el API Gateway maneja los CORS, pero lo dejamos por seguridad en capa 2
const allowedOrigins = envs.API_GATEWAY_URL 
    ? [envs.API_GATEWAY_URL, 'http://localhost:5173', 'https://fococero.cl']
    : ['http://localhost:5173', 'https://fococero.cl'];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Acceso denegado por políticas de CORS estricto'));
            }
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        ok: false,
        error: 'Demasiadas peticiones al sistema de reportes. Espere un momento.',
    },
});
app.use(limiter);

// 🛣️ 3. ENRUTAMIENTO PRINCIPAL
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        status: 'UP',
        service: 'ms-reportes',
        environment: envs.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// 📊 Endpoint de métricas Prometheus
app.get('/metrics', metricsHandler);

// ✅ FIX ARQUITECTÓNICO: Escuchamos en la raíz para que el API Gateway gestione el prefijo limpio
app.use('/', reporteRoutes);

// Fallback para rutas inexistentes (404)
app.use((req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada en ms-reportes.' });
});

// 🚨 4. MANEJADOR DE ERRORES GLOBAL
app.use(errorHandler);

// 🚀 5. INICIALIZACIÓN DEL SERVIDOR
const server = app.listen(envs.PORT, async () => {
    logger.info(`====================================================`);
    logger.info(`🌍 MICROSERVICIO MS-REPORTES (FocoCero) ACTIVADO`);
    logger.info(`📡 Puerto: ${envs.PORT} | Entorno: ${envs.NODE_ENV}`);

    try {
        await testDbConnection();
    } catch (error) {
        logger.error(
            { err: error },
            `⚠️ Advertencia: No se pudo verificar la conexión a la BD de Reportes`,
        );
    }

    logger.info(`🛡️  Seguridad: Limitador y Escudos Activos`);
    logger.info(`📖 Documentación: http://localhost:${envs.PORT}/api/docs`);
    logger.info(`====================================================`);

    initEurekaClient('ms-reportes', Number(envs.PORT));
    
});

// 🛑 6. APAGADO ELEGANTE (GRACEFUL SHUTDOWN)
const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Recibida señal de apagado (${signal}). Deteniendo tráfico HTTP...`);

    server.close(async () => {
        logger.info('✅ Servidor HTTP detenido.');
        try {
            await pool.end();
            logger.info('✅ Conexiones a la base de datos cerradas.');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, '❌ Error al cerrar conexiones DB');
            process.exit(1);
        }
    });

    // Fallback de seguridad por si las conexiones de DB se quedan colgadas
    setTimeout(() => {
        logger.error('❌ Cierre forzado por Timeout tras 10s.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
