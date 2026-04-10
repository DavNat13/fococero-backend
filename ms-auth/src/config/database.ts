// ms-auth/src/config/database.ts
import { Pool } from 'pg';
import { envs } from './envs';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    host: envs.DB_HOST,
    port: envs.DB_PORT, // Tipado estricto garantizado por env-var
    database: envs.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('📦 [DB] Conectado exitosamente a PostgreSQL (ms-auth)');
});

pool.on('error', (err: Error) => {
    console.error('❌ [DB] Error fatal o pérdida de conexión en ms-auth:', err.message);
    process.exit(-1);
});

export const testDbConnection = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT NOW()');
        console.log(`📡 [DB] Motor de Identidad Operativo. Server Time: ${res.rows[0].now}`);
    } finally {
        client.release();
    }
};

/**
 * Graceful Shutdown: Cierre ordenado de conexiones.
 */
const closePool = async () => {
    console.log('🛑 [DB] Cerrando pool de conexiones de ms-auth...');
    await pool.end();
    console.log('✅ [DB] Pool cerrado.');
};

process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);
