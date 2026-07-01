// ms-geo/src/config/envs.ts
import 'dotenv/config';
import * as env from 'env-var';

const dbHostRaw = env.get('DB_HOST').default('localhost').asString();
const isDocker = dbHostRaw === 'db-fococero';

export const envs = {
    PORT: env.get('PORT').default(3002).asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),

    // Base de Datos - Lógica Híbrida Inteligente
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    EUREKA_HOST: env.get('EUREKA_HOST').default('localhost').asString(),

    /**
     * Si detecta la red de Docker, usa el host interno y puerto 5432.
     * De lo contrario, asume desarrollo local y usa el puerto 5433 expuesto.
     */
    DB_HOST: isDocker ? dbHostRaw : env.get('DB_HOST_LOCAL').default('localhost').asString(),
    DB_PORT: isDocker
        ? env.get('DB_PORT').default(5432).asPortNumber()
        : env.get('DB_PORT_LOCAL').default(5433).asPortNumber(),

    // URL del API Gateway (para CORS estricto)
    API_GATEWAY_URL: env.get('API_GATEWAY_URL').default('http://localhost:3000').asString(),

    // Firebase
    FIREBASE_PROJECT_ID: env.get('FIREBASE_PROJECT_ID').required().asString(),
    FIREBASE_CLIENT_EMAIL: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
    FIREBASE_PRIVATE_KEY: env
        .get('FIREBASE_PRIVATE_KEY')
        .required()
        .asString()
        .replace(/\\n/g, '\n')
        .replace(/"/g, '')
        .trim(),
    INTERNAL_SECRET_TOKEN: env.get('INTERNAL_SECRET_TOKEN').default('dev-internal-secret').asString(),
};
