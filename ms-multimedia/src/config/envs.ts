// ms-multimedia/src/config/envs.ts

import 'dotenv/config';
import { z } from 'zod';

const envVarsSchema = z.object({
    PORT: z.string().transform(Number).default('3005'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GATEWAY_URL: z.string().url(),

    // --- FIREBASE ADMIN SDK & STORAGE ---
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_PRIVATE_KEY: z.string(),
    FIREBASE_STORAGE_BUCKET: z.string(),

    // --- BASE DE DATOS HÍBRIDA ---
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
    console.error('❌ Error CRÍTICO: Variables de entorno inválidas o faltantes en ms-multimedia.');
    // Muestra exactamente qué variable falló
    console.error(error.format());
    throw new Error('Variables de entorno inválidas');
}

export const envs = data;
