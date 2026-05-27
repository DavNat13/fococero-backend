// ms-template/src/index.ts

import app from './app';
import { envs } from './config/envs';
import { pool } from './config/database';

// --- 🚀 INICIO DE SERVIDOR ---
const server = app.listen(envs.PORT, () => {
    console.log(`🚀 ms-template corriendo en puerto ${envs.PORT}`);
    console.log(`📡 Puerto: ${envs.PORT} | DB: PostgreSQL Conectada`);

    // --- 📡 EUREKA CLIENT (Descomenta cuando el servidor Eureka esté disponible) ---
    // initEurekaClient('ms-template', envs.PORT);
});

// --- 🛑 APAGADO ELEGANTE ---
const gracefulShutdown = async () => {
    console.log('\n🛑 Apagando servidor...');
    server.close(async () => {
        try {
            await pool.end();
            console.log('✅ Apagado exitoso.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error al desconectar DB:', err);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
