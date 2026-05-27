// ms-auth/src/config/envs.ts
import 'dotenv/config';
import * as env from 'env-var';

/**
 * Arquitectura de Configuración: Fail-Fast (ms-auth)
 * Validación estricta y tipado fuerte para el Proveedor de Identidad.
 */
export const envs = {
    // Servidor
    PORT: env.get('PORT').required().asPortNumber(),
    NODE_ENV: env.get('NODE_ENV').default('development').asString(),

    // Base de Datos - Cero defaults para evitar conexiones accidentales a entornos equivocados
    DB_USER: env.get('DB_USER').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_HOST: env.get('DB_HOST').required().asString(),
    DB_PORT: env.get('DB_PORT').required().asPortNumber(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    EUREKA_HOST: env.get('EUREKA_HOST').default('localhost').asString(),

    // URL del API Gateway (para CORS estricto)
    API_GATEWAY_URL: env.get('API_GATEWAY_URL').default('http://localhost:3000').asString(),

    // Firebase Admin SDK (Secretos)
    FIREBASE_PROJECT_ID: env.get('FIREBASE_PROJECT_ID').required().asString(),
    FIREBASE_CLIENT_EMAIL: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),

    // Tratamiento seguro de la llave privada (escapando saltos de línea para OpenSSL)
    FIREBASE_PRIVATE_KEY: env
        .get('FIREBASE_PRIVATE_KEY')
        .required()
        .asString()
        .replace(/\\n/g, '\n'),
};
