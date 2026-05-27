import app from './app';
import { envs } from './config/envs';
import { pool } from './config/db';
import { eurekaClient, initEureka } from './config/eureka';
import { Logger } from './helpers/logger';

const PORT = envs.PORT;

// ============================================================================
// 🚀 1. LANZAMIENTO
// ============================================================================
const server = app.listen(PORT, async () => {
    Logger.info(`====================================================`);
    Logger.info(`🚒 MICROSERVICIO MS-EMERGENCIAS (FocoCero) ACTIVADO`);
    Logger.info(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);
    Logger.info(`====================================================`);

    // Inicialización modular de Eureka
    initEureka();
});

// ============================================================================
// 🛑 2. MANEJO DE ERRORES NO CAPTURADOS
// ============================================================================
process.on('unhandledRejection', (reason: unknown) => {
    Logger.error('🚨 UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error: Error) => {
    Logger.error('🚨 UNCAUGHT EXCEPTION:', error);
    gracefulShutdown('uncaughtException');
});

// ============================================================================
// 🛑 3. CIERRE CONTROLADO (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    Logger.info(`🛑 Apagando ms-emergencias (${signal})...`);

    // 1ro: Desregistrar de Eureka (Usando el cliente importado)
    eurekaClient.stop((error) => {
        if (error) Logger.error('❌ Error en Eureka Stop:', error);
        else Logger.info('✅ ms-emergencias desregistrado de Eureka.');

        // 2do: Cierre de conexiones
        server.close(async () => {
            try {
                await pool.end();
                Logger.info('✅ Base de datos desconectada. Sistema cerrado.');
                process.exit(0);
            } catch (err) {
                Logger.error('❌ Error al cerrar DB:', err);
                process.exit(1);
            }
        });
    });

    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));