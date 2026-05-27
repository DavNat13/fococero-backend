import { Pool, PoolConfig } from 'pg';
import { envs } from './envs';
import { Logger } from '../helpers/logger';

/**
 * Configuración del Pool de conexiones.
 * Optimizada para entornos de alta disponibilidad y contenedores Docker.
 */
const poolConfig: PoolConfig = {
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,

    // Configuración de resiliencia
    max: 20, // Máximo de clientes simultáneos
    idleTimeoutMillis: 30000, // Tiempo antes de cerrar una conexión inactiva
    connectionTimeoutMillis: 2000, // Tiempo máximo para esperar una conexión disponible
};

export const pool = new Pool(poolConfig);

/**
 * Listener de errores del Pool.
 * Evita que el microservicio colapse si la base de datos se reinicia inesperadamente.
 */
pool.on('error', (err) => {
    Logger.error('🚨 [ms-emergencias] Error inesperado en el pool de PostgreSQL:', err);
    // En producción, aquí se dispararía una alerta a Sentry o CloudWatch
});

/**
 * Función de verificación de salud (Health Check).
 * Se invoca al arrancar el servidor para asegurar que la DB está lista.
 */
export const testDbConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        Logger.info('✅ [ms-emergencias] Conexión a PostgreSQL establecida con éxito.');
        client.release();
        return true;
    } catch (error) {
        Logger.error('❌ [ms-emergencias] Error conectando a PostgreSQL:', error);
        return false;
    }
};
