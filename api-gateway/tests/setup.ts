// tests/setup.ts
// Sets environment variables for testing BEFORE any modules are loaded

process.env.NODE_ENV = 'test';

// URLs de Microservicios (usando localhost para que los proxies fallen rápidamente)
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.GEO_SERVICE_URL = 'http://localhost:3002';
process.env.ALERTAS_SERVICE_URL = 'http://localhost:3003';
process.env.REPORTES_SERVICE_URL = 'http://localhost:3004';
process.env.MULTIMEDIA_SERVICE_URL = 'http://localhost:3005';
process.env.EMERGENCIAS_SERVICE_URL = 'http://localhost:3006';
process.env.ANALITICA_SERVICE_URL = 'http://localhost:3007';
process.env.EUREKA_HOST = 'localhost';

process.env.INTERNAL_SECRET_TOKEN = 'test-secret-token-for-testing';
process.env.CORS_ORIGINS = 'http://localhost:5173';

// Firebase mock values (these must pass Zod validation in envs.ts)
process.env.FIREBASE_PROJECT_ID = 'test-project-id';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCdummy\n-----END PRIVATE KEY-----';
