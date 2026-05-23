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

const app: Application = express();

// 1. MIDDLEWARES GLOBALES
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. DOCUMENTACIÓN
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'FocoCero API - Multimedia',
        customCss: '.swagger-ui .topbar { display: none }',
    }),
);

// 3. RUTAS PRINCIPALES Y HEALTHCHECK
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'ms-multimedia',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/v1/multimedia', multimediaRoutes);

// 4. RED DE SEGURIDAD (Siempre al final)
app.use(errorHandler);

// ============================================================================
// 🚀 BOOTSTRAP Y CICLO DE VIDA (SENIOR PATTERN)
// ============================================================================
async function bootstrap() {
    try {
        console.log(`\n====================================================`);
        console.log(`🎥 INICIANDO MS-MULTIMEDIA (FocoCero Process)`);
        console.log(`====================================================`);

        const server = app.listen(envs.PORT, () => {
            console.log(`🚀 [SERVER] Escuchando en puerto: ${envs.PORT}`);
            console.log(`🌐 [ENV] Modo: ${envs.NODE_ENV.toUpperCase()}`);
            console.log(`📚 [DOCS] http://localhost:${envs.PORT}/api-docs`);
            
            // Iniciar procesos en background
            iniciarBarrendero();
            console.log(`🧹 [CRON] Sistema Barrendero activado.`);

            // Registro en Service Discovery
            initEureka();
        });

        // ============================================================================
        // 🛑 GRACEFUL SHUTDOWN
        // ============================================================================
        const handleShutdown = async (signal: string) => {
            console.log(`\n⚠️  [${signal}] Señal de apagado recibida. Iniciando Graceful Shutdown...`);

            // 1. Salir de Eureka para no recibir peticiones con archivos a medio subir
            eurekaClient.stop((eurekaError) => {
                if (eurekaError) console.error("❌ [EUREKA] Error al desregistrar:", eurekaError);
                else console.log("✅ [EUREKA] Retirado de la malla de servicios.");

                // 2. Apagar servidor HTTP
                server.close(() => {
                    console.log("✅ [SERVER] Servidor HTTP detenido.");
                    
                    // Nota: Si en el futuro exportas el pool de ./config/db, ciérralo aquí.
                    
                    console.log("👋 [SISTEMA] Apagado completado de forma segura.\n");
                    process.exit(0);
                });
            });

            setTimeout(() => {
                console.error("🔥 [FATAL] El cierre tardó demasiado. Forzando salida.");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGINT", () => handleShutdown("SIGINT"));
        process.on("SIGTERM", () => handleShutdown("SIGTERM"));

    } catch (error) {
        console.error(`\n❌ [FATAL] Error durante el arranque:`, error);
        process.exit(1);
    }
}

bootstrap();