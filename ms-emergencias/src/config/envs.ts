import 'dotenv/config';
import * as env from 'env-var';

// Detecta si corre dentro de la red de Docker
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.DB_HOST === 'db-fococero';

export const envs = {
    PORT: env.get('PORT').required().asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),

    // Lógica Híbrida para Base de Datos
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    EUREKA_HOST: env.get('EUREKA_HOST').default('localhost').asString(),
    DB_HOST: isDocker
        ? env.get('DB_HOST').required().asString()
        : env.get('DB_HOST_LOCAL').required().asString(),
    DB_PORT: isDocker
        ? env.get('DB_PORT').required().asPortNumber()
        : env.get('DB_PORT_LOCAL').required().asPortNumber(),

    // Seguridad e Internos
    INTERNAL_SECRET_TOKEN: env.get('INTERNAL_SECRET_TOKEN').required().asString(),
    API_GATEWAY_URL: env.get('API_GATEWAY_URL').required().asString(),

    // Webhooks Externos
    BOMBEROS_API_URL: env.get('BOMBEROS_API_URL').required().asString(),
    BOMBEROS_API_KEY: env.get('BOMBEROS_API_KEY').required().asString(),
    CONAF_API_URL: env.get('CONAF_API_URL').required().asString(),
    CONAF_API_KEY: env.get('CONAF_API_KEY').required().asString(),
    CARABINEROS_API_URL: env.get('CARABINEROS_API_URL').required().asString(),
    CARABINEROS_API_KEY: env.get('CARABINEROS_API_KEY').required().asString(),
    SENAPRED_API_URL: env.get('SENAPRED_API_URL').required().asString(),
    SENAPRED_API_KEY: env.get('SENAPRED_API_KEY').required().asString(),

    // Resiliencia (Estas eran las que daban error)
    MAX_RETRIES: env.get('MAX_RETRIES').default(3).asIntPositive(),
    RETRY_DELAY_MS: env.get('RETRY_DELAY_MS').default(2000).asIntPositive(),
    AXIOS_TIMEOUT_MS: env.get('AXIOS_TIMEOUT_MS').default(5000).asIntPositive(),
};
