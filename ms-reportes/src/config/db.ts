// ms-reportes/src/config/db.ts
import { Pool } from 'pg';
import { envs } from './envs';

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
    console.log('✅ Conexión a PostgreSQL (PostGIS) establecida con éxito en ms-reportes.');
});

pool.on('error', (err: Error) => {
    console.error('❌ Error inesperado en el pool de base de datos de reportes:', err.message);
    process.exit(-1);
});

export const testDbConnection = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT NOW()');
        console.log(`📡 Motor de Reportes Operativo. Server Time: ${res.rows[0].now}`);
    } finally {
        client.release();
    }
};

// Graceful Shutdown
const closePool = async () => {
    console.log('🛑 Cerrando pool de conexiones de ms-reportes...');
    await pool.end();
    console.log('✅ Pool cerrado.');
};

process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);
