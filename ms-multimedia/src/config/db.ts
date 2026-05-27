// ms-multimedia/src/config/db.ts
import { Pool } from 'pg';
import { envs } from './envs';
import { logger } from './logger';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    host: envs.DB_HOST, // 
    port: envs.DB_PORT, // 
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
});

pool.on('error', (err: unknown) => {
    logger.error('🔥 Error crítico inesperado en el Pool de PostgreSQL (ms-multimedia):', err);
});

pool.query('SELECT NOW()')
    .then(() => {
        logger.info('✅ Conexión a PostgreSQL (PostGIS) establecida con éxito en ms-multimedia.');
    })
    .catch((err: unknown) => {
        logger.error('❌ Error conectando a PostgreSQL:', err);
    });
