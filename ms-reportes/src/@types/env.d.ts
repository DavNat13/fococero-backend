// ms-reportes/src/@types/env.d.ts
declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: string;
        NODE_ENV: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_HOST: string;
        DB_PORT: string;
        DB_NAME: string;
        FIREBASE_PROJECT_ID: string;
        FIREBASE_CLIENT_EMAIL: string;
        FIREBASE_PRIVATE_KEY: string;
        JWT_SECRET: string;
    }
}
