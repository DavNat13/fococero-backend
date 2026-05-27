import 'dotenv/config';
import { z } from 'zod';
import { logger } from './logger';

const envVarsSchema = z.object({
    PORT: z.string().transform(Number).default('3005'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    EUREKA_HOST: z.string().min(1),
    INTERNAL_SECRET_TOKEN: z.string().min(1),
    GATEWAY_URL: z.string().url(),
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_PRIVATE_KEY: z.string(),
    FIREBASE_STORAGE_BUCKET: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.string().transform(Number).default('5432'),
    DB_HOST_LOCAL: z.string().default('localhost'),
    DB_PORT_LOCAL: z.string().transform(Number).default('5433'),
});

const { data, error } = envVarsSchema.safeParse(process.env);

if (error) {
    logger.error(`Error de validación de variables de entorno: ${error.message}`);
    process.exit(1);
}

const isDocker = process.env.DB_HOST === 'db-fococero';

export const envs = {
    ...data,
    DB_HOST: isDocker ? data.DB_HOST : data.DB_HOST_LOCAL,
    DB_PORT: isDocker ? data.DB_PORT : data.DB_PORT_LOCAL,
};
