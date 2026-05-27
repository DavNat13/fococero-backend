// ms-reportes/src/config/db.ts
import { Pool } from 'pg';
import { envs } from './envs';
import { logger } from './logger';

export const pool = new Pool({
    host: envs.DB_HOST,
    port: envs.DB_PORT, // Ya viene tipado como número gracias a env-var
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    logger.info('✅ Conexión a PostgreSQL (PostGIS) establecida con éxito en ms-reportes.');
});

pool.on('error', (err: Error) => {
    logger.error({ err }, '❌ Error inesperado en el pool de base de datos de reportes');
    process.exit(-1);
});

export const testDbConnection = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT NOW()');
        logger.info(`📡 Motor de Reportes Operativo. Server Time: ${res.rows[0].now}`);
    } finally {
        client.release();
    }
};

// Graceful Shutdown
const closePool = async () => {
    logger.info('🛑 Cerrando pool de conexiones de ms-reportes...');
    await pool.end();
    logger.info('✅ Pool cerrado.');
};

process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);
