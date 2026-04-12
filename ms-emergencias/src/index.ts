import app from './app';
import { envs } from './config/envs';
import { pool } from './config/db';

const PORT = envs.PORT;

// ============================================================================
// 🚀 1. LANZAMIENTO
// ============================================================================
const server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🚒 MICROSERVICIO MS-EMERGENCIAS (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);
    console.log(`🛡️  Seguridad: Zero-Trust, Timeout y Escudos Activos`);
    console.log(`====================================================\n`);
});

// ============================================================================
// 🛑 2. CIERRE CONTROLADO (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Apagando ms-emergencias (${signal})...`);

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

    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
