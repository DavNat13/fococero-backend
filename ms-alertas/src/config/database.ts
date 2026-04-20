// ms-alertas/src/config/database.ts
import { Pool } from 'pg';
import { envs } from './envs';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('📦 [DB] Pool de conexiones PostgreSQL inicializado.');
});

pool.on('error', (err: Error) => {
    console.error('❌ [DB] Error inesperado en el Pool:', err.message);
});

export const testDbConnection = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT NOW()');
        console.log(`📡 [DB] PostGIS Operativo. Server Time: ${res.rows[0].now}`);
    } finally {
        client.release();
    }
};

/**
 * Graceful Shutdown: Cierra el pool ordenadamente cuando se detiene el microservicio.
 * Vital para evitar saturar el servidor DB en despliegues con Docker/K8s.
 */
const closePool = async () => {
    console.log('🛑 [DB] Cerrando pool de conexiones...');
    await pool.end();
    console.log('✅ [DB] Pool cerrado.');
};

process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);
