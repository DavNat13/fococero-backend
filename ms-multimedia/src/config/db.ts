// ms-multimedia/src/config/db.ts

import { Pool } from 'pg';
import { envs } from './envs';

// Lógica de Red Híbrida:
// Si detectamos la variable de entorno nativa de Docker o estamos en producción, usamos DB_HOST (db-fococero).
// De lo contrario, asumimos que se ejecuta desde la terminal local y usamos DB_HOST_LOCAL (localhost).
const isRunningInDocker =
    process.env.RUNNING_IN_DOCKER === 'true' || envs.NODE_ENV === 'production';

const currentDbHost = isRunningInDocker ? envs.DB_HOST : envs.DB_HOST_LOCAL;
const currentDbPort = isRunningInDocker ? envs.DB_PORT : envs.DB_PORT_LOCAL;

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    host: currentDbHost,
    port: currentDbPort,
    max: 20, // Límite de conexiones simultáneas
    idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30s
    connectionTimeoutMillis: 3000, // Falla rápido si no puede conectar en 3s
});

// Listener de seguridad para evitar caídas silenciosas
pool.on('error', (err: Error) => {
    console.error('🔥 Error crítico inesperado en el Pool de PostgreSQL (ms-multimedia):', err);
    process.exit(-1);
});

// Prueba de conexión al iniciar
pool.query('SELECT NOW()')
    .then(() =>
        console.log(
            `📦 Conectado a PostgreSQL [ms-multimedia] en ${currentDbHost}:${currentDbPort}`,
        ),
    )
    .catch((err: Error) => console.error('❌ Error conectando a PostgreSQL:', err.message));
