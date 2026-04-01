import { Pool } from 'pg';
import { envs } from './envs';

const pool = new Pool({
    host: envs.DB_HOST,
    port: Number(envs.DB_PORT),
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    max: 20, // Límite de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✅ Conexión a PostgreSQL (PostGIS) establecida con éxito en ms-reportes.');
});

pool.on('error', (err: Error) => {
    console.error('❌ Error inesperado en el pool de base de datos:', err);
    process.exit(-1);
});

export default pool;