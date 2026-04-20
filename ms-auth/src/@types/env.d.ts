// src/@types/env.d.ts

declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: string;
        
        // Variables de Base de Datos
        DB_USER: string;
        DB_HOST: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        DB_PORT: string;
        
        // Variables de Firebase (Agregadas para el nuevo sistema)
        FIREBASE_PROJECT_ID: string;
        FIREBASE_CLIENT_EMAIL: string;
        FIREBASE_PRIVATE_KEY: string;
    }
}