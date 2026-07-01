// ms-reportes/src/config/envs.ts
import 'dotenv/config';
import * as env from 'env-var';

const dbHostRaw = env.get('DB_HOST').asString();
const isDocker = dbHostRaw === 'db-fococero';

export const envs = {
    PORT: env.get('PORT').default(3004).asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),
    EUREKA_HOST: env.get('EUREKA_HOST').default('localhost').asString(),

    // Base de Datos
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    DB_HOST: isDocker ? dbHostRaw : env.get('DB_HOST_LOCAL').default('localhost').asString(),
    DB_PORT: isDocker
        ? env.get('DB_PORT').default(5432).asPortNumber()
        : env.get('DB_PORT_LOCAL').default(5433).asPortNumber(),

    // URL del API Gateway (para CORS estricto)
    API_GATEWAY_URL: env.get('API_GATEWAY_URL').default('http://localhost:3000').asString(),

    //URL del Microservicio de Multimedia 
    MULTIMEDIA_SERVICE_URL: env.get('MULTIMEDIA_SERVICE_URL').required().asString(),

    // Firebase y Seguridad
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
    INTERNAL_SECRET_TOKEN: env.get('INTERNAL_SECRET_TOKEN').default('dev-internal-secret').asString(),
    RABBITMQ_URL: env.get('RABBITMQ_URL').default('amqp://localhost').asString(),
};
