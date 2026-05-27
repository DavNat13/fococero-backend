// ms-geo/src/config/database.ts
import { Pool } from 'pg';
import { envs } from './envs';
import { logger } from './logger';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    logger.info('📦 ms-geo: Conectado exitosamente a PostgreSQL (PostGIS)');
});

pool.on('error', (err: Error) => {
    logger.error({ err }, '❌ ms-geo: Error inesperado en el pool de base de datos');
    // No matamos el proceso aquí para permitir que Docker Healthcheck lo gestione
});

export const testDbConnection = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT PostGIS_version();');
        logger.info('🗺️  Motor Espacial PostGIS detectado:', res.rows[0].postgis_version);
        client.release();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn({ err: message }, '⚠️ ms-geo: Advertencia - No se pudo conectar a PostGIS inicialmente');
    }
};
