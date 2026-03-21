import { Pool } from 'pg';
import { envs } from './envs'; // Importamos nuestro objeto validado

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
    console.log('📦 Conectado exitosamente a PostgreSQL (FocoCero DB)');
});

pool.on('error', (err: Error) => {
    console.error('❌ Error fatal o pérdida de conexión con PostgreSQL:', err.message);
    process.exit(-1); 
});