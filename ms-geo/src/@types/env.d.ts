// src/@types/env.d.ts

declare namespace NodeJS {
    export interface ProcessEnv {
        PORT?: string;
        NODE_ENV?: 'development' | 'production' | 'test';

        // Variables de Base de Datos (PostGIS) - Lógica Docker
        DB_USER?: string;
        DB_HOST?: string;
        DB_PASSWORD?: string;
        DB_NAME?: string;
        DB_PORT?: string;

        // Variables para Desarrollo Local (npm run dev)
        DB_HOST_LOCAL?: string;
        DB_PORT_LOCAL?: string;

        // Variables de Firebase Admin SDK
        FIREBASE_PROJECT_ID?: string;
        FIREBASE_CLIENT_EMAIL?: string;
        FIREBASE_PRIVATE_KEY?: string;

        // Seguridad
        JWT_SECRET?: string;
    }
}
