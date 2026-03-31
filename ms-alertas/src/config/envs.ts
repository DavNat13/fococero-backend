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
];

requiredEnvs.forEach((envName) => {
    if (!process.env[envName]) {
        console.error(`🚨 FATAL ERROR (ms-alertas): Falta la variable de entorno: ${envName}`);
        // process.exit(1); // Descomentar en producción para evitar arranques fallidos
    }
});

export const envs = {
    PORT: process.env.PORT || 3003, // Puerto exclusivo de ms-alertas
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,

    // Credenciales de Firebase (con limpieza del salto de línea)
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
};
