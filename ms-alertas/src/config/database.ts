import { Pool } from 'pg';
import { envs } from './envs';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    host: envs.DB_HOST,
    port: Number(envs.DB_PORT),
    database: envs.DB_NAME,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('📦 Conectado exitosamente a PostgreSQL (FocoCero DB - Alertas)');
});

pool.on('error', (err: Error) => {
    console.error(
        '❌ Error fatal o pérdida de conexión con PostgreSQL en ms-alertas:',
        err.message,
    );
    process.exit(-1);
});

// Función para probar la conexión al levantar el servidor
export const testDbConnection = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT NOW()');
        console.log(`📡 Motor PostgreSQL Operativo. Hora del servidor DB: ${res.rows[0].now}`);
    } finally {
        client.release();
    }
};
