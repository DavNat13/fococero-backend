// src/config/envs.ts

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
    'FIREBASE_PRIVATE_KEY'
];

// Escudo 1: Validar ANTES de hacer cualquier cosa
requiredEnvs.forEach((envName) => {
    if (!process.env[envName]) {
        console.error(`🚨 FATAL ERROR: Falta la variable de entorno obligatoria: ${envName}`);
        process.exit(1); // Apagamos el proceso inmediatamente. No tiene sentido arrancar a ciegas.
    }
});

export const envs = {
    PORT: parseInt(process.env.PORT || '3002', 10),
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_HOST: process.env.DB_HOST!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    
    // Escudo 2: Reparador automático de saltos de línea para la llave de Firebase
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL!,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};