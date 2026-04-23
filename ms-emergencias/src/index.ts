import app from './app';
import { envs } from './config/envs';
import { pool } from './config/db';
import { eurekaClient, initEureka } from './config/eureka';

const PORT = envs.PORT;

// ============================================================================
// 🚀 1. LANZAMIENTO
// ============================================================================
const server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🚒 MICROSERVICIO MS-EMERGENCIAS (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);
    console.log(`====================================================\n`);

    // Inicialización modular de Eureka
    initEureka();
});

// ============================================================================
// 🛑 2. CIERRE CONTROLADO (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Apagando ms-emergencias (${signal})...`);

    // 1ro: Desregistrar de Eureka (Usando el cliente importado)
    eurekaClient.stop((error) => {
        if (error) console.error('❌ Error en Eureka Stop:', error);
        else console.log('✅ ms-emergencias desregistrado de Eureka.');

        // 2do: Cierre de conexiones
        server.close(async () => {
            try {
                await pool.end();
                console.log('✅ Base de datos desconectada. Sistema cerrado.');
                process.exit(0);
            } catch (err) {
                console.error('❌ Error al cerrar DB:', err);
                process.exit(1);
            }
        });
    });

    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));