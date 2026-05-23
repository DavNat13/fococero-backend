import { Pool } from 'pg';
import { envs } from './envs';

// ==========================================
// 🗄️ Pool de Conexion PostgreSQL
// ==========================================
export const pool = new Pool({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    max: envs.DB_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Conexion a PostgreSQL exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a PostgreSQL:', error);
        return false;
    }
};