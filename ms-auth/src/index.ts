import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express'; 
import swaggerDocument from './docs/swagger.json'; 
import { envs } from './config/envs';
import './config/firebase';
import { pool } from './config/database';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics.middleware';
import { logger } from './config/logger';

import { initEurekaClient } from './config/eureka.client';

const app: Application = express();

// --- 🛡️ SEGURIDAD PERIMETRAL ---
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

// CORS Estricto: Solo permite el origen del API Gateway.
app.use(cors({ origin: envs.API_GATEWAY_URL || 'http://localhost:3000' }));

app.use(express.json());
app.use(morgan('dev'));

// 📊 Monitoreo de métricas (Prometheus)
app.use(metricsMiddleware);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Demasiadas peticiones desde esta IP. Por favor, intenta en 15 minutos.' },
});

// --- 🚦 RUTAS Y DOCUMENTACIÓN ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'ms-auth' });
});

// 📊 Endpoint de métricas Prometheus
app.get('/metrics', metricsHandler);

// 📖 Ruta para la documentación interactiva de la API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', apiLimiter, authRoutes);
app.use(errorHandler);

// --- 🚀 INICIO DE SERVIDOR ---
const server = app.listen(envs.PORT, () => {
    logger.info(`🚀 FocoCero Auth blindado y rodando en el puerto ${envs.PORT}`);
    logger.info(`📡 Puerto: ${envs.PORT} | DB: PostgreSQL Conectada`);
    logger.info(`📖 Documentación disponible en: http://localhost:${envs.PORT}/api/docs`);

    initEurekaClient('ms-auth', envs.PORT);
});

// --- 🛑 APAGADO ELEGANTE (GRACEFUL SHUTDOWN) ---
// Cuando Docker o el sistema operativo ordenen detener el servicio:
const gracefulShutdown = async () => {
    logger.info('🛑 Recibida señal de apagado. Deteniendo tráfico HTTP...');

    server.close(async () => {
        logger.info('✅ Servidor HTTP cerrado (no se aceptan nuevas peticiones).');
        try {
            logger.info('🛑 Desconectando pool de PostgreSQL...');
            await pool.end(); // Cerramos la base de datos sin dejar conexiones colgadas
            logger.info('✅ Base de datos desconectada. Apagado exitoso.');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, '❌ Error al desconectar la base de datos');
            process.exit(1);
        }
    });
};

// Escuchamos las señales de apagado
process.on('SIGTERM', gracefulShutdown); // Señal típica de Docker/Kubernetes
process.on('SIGINT', gracefulShutdown); // Señal al presionar Ctrl+C en la terminal
