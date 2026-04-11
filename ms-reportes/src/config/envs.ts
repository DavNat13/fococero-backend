// ms-reportes/src/config/envs.ts
import 'dotenv/config';
import * as env from 'env-var';

// Detectamos si estamos en la red interna de Docker
const dbHostRaw = env.get('DB_HOST').asString();
const isDocker = dbHostRaw === 'db-fococero';

export const envs = {
    PORT: env.get('PORT').default(3004).asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),

    // Base de Datos - Lógica Híbrida
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_NAME: env.get('DB_NAME').required().asString(),

    /**
     * Si detecta 'db-fococero', usa la configuración de contenedor.
     * Si no, asume desarrollo local y usa el puerto 5433 mapeado en docker-compose.
     */
    DB_HOST: isDocker ? dbHostRaw : env.get('DB_HOST_LOCAL').default('localhost').asString(),

    DB_PORT: isDocker
        ? env.get('DB_PORT').default(5432).asPortNumber()
        : env.get('DB_PORT_LOCAL').default(5433).asPortNumber(),

    // Firebase Admin SDK
    FIREBASE_PROJECT_ID: env.get('FIREBASE_PROJECT_ID').required().asString(),
    FIREBASE_CLIENT_EMAIL: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
    FIREBASE_PRIVATE_KEY: env
        .get('FIREBASE_PRIVATE_KEY')
        .required()
        .asString()
        .replace(/\\n/g, '\n')
        .replace(/"/g, '')
        .trim(),

    JWT_SECRET: env.get('JWT_SECRET').required().asString(),
};
