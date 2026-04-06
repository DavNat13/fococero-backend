// ms-reportes/src/config/envs.ts

import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
    'PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_NAME',
    'DB_PORT',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'JWT_SECRET',
];

requiredEnvs.forEach((envName) => {
    // Usamos opcional chaining y trim() para evitar falsos negativos por espacios
    if (!process.env[envName]?.trim()) {
        console.error(`🚨 FATAL ERROR (ms-reportes): Falta la variable de entorno: ${envName}`);
    }
});

export const envs = {
    PORT: Number(process.env.PORT) || 3004,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: Number(process.env.DB_PORT),

    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',

    JWT_SECRET: process.env.JWT_SECRET || '',
    NODE_ENV: process.env.NODE_ENV?.trim() || 'development',
};
