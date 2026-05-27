// ms-alertas/src/config/envs.ts
import 'dotenv/config';
import * as env from 'env-var';

/**
 * Arquitectura de Configuración: Fail-Fast
 * Este módulo valida que todas las variables necesarias existan y tengan el tipo correcto.
 * Si alguna falla, la librería lanzará una excepción y el proceso terminará,
 * evitando que el microservicio opere en un estado degradado o inseguro.
 */

export const envs = {
    // Servidor
    PORT: env.get('PORT').required().asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),

    // Base de Datos - Sin valores por defecto para forzar configuración explícita
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_HOST: env.get('DB_HOST').required().asString(),
    DB_PORT: env.get('DB_PORT').required().asPortNumber(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    EUREKA_HOST: env.get('EUREKA_HOST').default('localhost').asString(),

    // 🌐 URL del API Gateway (para CORS estricto)
    API_GATEWAY_URL: env.get('API_GATEWAY_URL').default('http://localhost:3000').asString(),

    // 🖼️ URL del Microservicio de Multimedia
    MULTIMEDIA_SERVICE_URL: env.get('MULTIMEDIA_SERVICE_URL').required().asString(),

    // Firebase Admin SDK
    FIREBASE_PROJECT_ID: env.get('FIREBASE_PROJECT_ID').required().asString(),
    FIREBASE_CLIENT_EMAIL: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),

    // Tratamiento especial para llaves privadas de Firebase
    FIREBASE_PRIVATE_KEY: env
        .get('FIREBASE_PRIVATE_KEY')
        .required()
        .asString()
        .replace(/\\n/g, '\n'), // Asegura que los saltos de línea sean válidos para OpenSSL
};
