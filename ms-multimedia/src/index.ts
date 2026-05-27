// ms-multimedia/src/index.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// ==========================================
// CONFIGURACIONES E INICIALIZACIONES
// ==========================================
import { envs } from './config/envs';
import './config/db'; 
import './config/firebase'; 
import { eurekaClient, initEureka } from './config/eureka';

// ==========================================
// RUTAS, DOCS Y CRON
// ==========================================
import multimediaRoutes from './routes/multimedia.routes';
import { swaggerSpec } from './docs/swagger';
import { iniciarBarrendero } from './cron/barrendero';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics.middleware';
import { logger } from './config/logger';

const app: Application = express();

// 1. MIDDLEWARES GLOBALES
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
app.use(cors({ origin: envs.GATEWAY_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. MONITOREO DE MÉTRICAS (PROMETHEUS)
app.use(metricsMiddleware);

// 3. DOCUMENTACIÓN
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'FocoCero API - Multimedia',
        customCss: '.swagger-ui .topbar { display: none }',
    }),
);

// 4. RUTAS PRINCIPALES
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'ms-multimedia',
        timestamp: new Date().toISOString(),
    });
});

// 📊 Endpoint de métricas Prometheus
app.get('/metrics', metricsHandler);

app.use('/api/v1/multimedia', multimediaRoutes);

// 5. RED DE SEGURIDAD (Siempre al final)
app.use(errorHandler);

// ============================================================================
// 🚀 BOOTSTRAP Y CICLO DE VIDA (SENIOR PATTERN)
// ============================================================================
async function bootstrap() {
    try {
        logger.info(`====================================================`);
        logger.info(`🎥 INICIANDO MS-MULTIMEDIA (FocoCero Process)`);
        logger.info(`====================================================`);

        const server = app.listen(envs.PORT, () => {
            logger.info(`🚀 [SERVER] Escuchando en puerto: ${envs.PORT}`);
            logger.info(`🌐 [ENV] Modo: ${envs.NODE_ENV.toUpperCase()}`);
            logger.info(`📚 [DOCS] http://localhost:${envs.PORT}/api-docs`);
            
            // Iniciar procesos en background
            iniciarBarrendero();
            logger.info(`🧹 [CRON] Sistema Barrendero activado.`);

            // Registro en Service Discovery
            initEureka();
        });

        // ============================================================================
        // 🛑 GRACEFUL SHUTDOWN
        // ============================================================================
        const handleShutdown = async (signal: string) => {
            logger.info(`⚠️  [${signal}] Señal de apagado recibida. Iniciando Graceful Shutdown...`);

            // 1. Salir de Eureka para no recibir peticiones con archivos a medio subir
            eurekaClient.stop((eurekaError) => {
                if (eurekaError) logger.error("❌ [EUREKA] Error al desregistrar", eurekaError);
                else logger.info("✅ [EUREKA] Retirado de la malla de servicios.");

                // 2. Apagar servidor HTTP
                server.close(() => {
                    logger.info("✅ [SERVER] Servidor HTTP detenido.");
                    
                    // Nota: Si en el futuro exportas el pool de ./config/db, ciérralo aquí.
                    
                    logger.info("👋 [SISTEMA] Apagado completado de forma segura.");
                    process.exit(0);
                });
            });

            setTimeout(() => {
                logger.error("🔥 [FATAL] El cierre tardó demasiado. Forzando salida.");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGINT", () => handleShutdown("SIGINT"));
        process.on("SIGTERM", () => handleShutdown("SIGTERM"));

    } catch (error) {
        logger.error(`❌ [FATAL] Error durante el arranque:`, error);
        process.exit(1);
    }
}

bootstrap();