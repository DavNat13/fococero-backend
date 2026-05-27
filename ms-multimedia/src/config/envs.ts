import 'dotenv/config';
import { z } from 'zod';
import { logger } from './logger';

const testDefaults = {
    EUREKA_HOST: 'localhost',
    INTERNAL_SECRET_TOKEN: 'test-token',
    DB_USER: 'test',
    DB_PASSWORD: 'test',
    DB_NAME: 'testdb',
    DB_HOST: 'localhost',
};

const envVarsSchema = z.object({
    PORT: z.string().transform(Number).default('3005'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    EUREKA_HOST: z.string().min(1).default('localhost'),
    INTERNAL_SECRET_TOKEN: z.string().min(1).default('test-token'),
    GATEWAY_URL: z.string().url().default('http://localhost:3000'),
    FIREBASE_PROJECT_ID: z.string().default('test-project'),
    FIREBASE_CLIENT_EMAIL: z.string().email().default('test@test.com'),
    FIREBASE_PRIVATE_KEY: z.string().default('test-key'),
    FIREBASE_STORAGE_BUCKET: z.string().default('test-bucket'),
    DB_USER: z.string().default('test'),
    DB_PASSWORD: z.string().default('test'),
    DB_NAME: z.string().default('testdb'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.string().transform(Number).default('5432'),
    DB_HOST_LOCAL: z.string().default('localhost'),
    DB_PORT_LOCAL: z.string().transform(Number).default('5433'),
});

const mergedEnv = { ...testDefaults, ...process.env };
const parsed = envVarsSchema.safeParse(mergedEnv);

if (parsed.error) {
    if (process.env.NODE_ENV === 'test') {
        logger.warn(`Variables de entorno faltantes en test: ${parsed.error.message}. Usando defaults.`);
    } else {
        logger.error(`Error de validación de variables de entorno: ${parsed.error.message}`);
        process.exit(1);
    }
}

const envData = parsed.data ?? envVarsSchema.parse({});
const isDocker = process.env.DB_HOST === 'db-fococero';

export const envs = {
    ...envData,
    DB_HOST: isDocker ? envData.DB_HOST : envData.DB_HOST_LOCAL,
    DB_PORT: isDocker ? envData.DB_PORT : envData.DB_PORT_LOCAL,
};
