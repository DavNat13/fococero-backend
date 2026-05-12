import dotenv from 'dotenv';
dotenv.config();

// ==========================================
// 🔐 Variables de Entorno - ms-template
// ==========================================
// Copia este archivo como .env y configura los valores

export const envs = {
    // Puerto del servicio
    PORT: parseInt(process.env.PORT || '3000', 10),

    // Base de datos PostgreSQL
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USER: process.env.DB_USER || 'fococero_admin',
    DB_PASSWORD: process.env.DB_PASSWORD || 'fococero_pass',
    DB_NAME: process.env.DB_NAME || 'fococero_ms_template',
    DB_MAX: parseInt(process.env.DB_MAX || '20', 10),

    // Redis (opcional)
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

    // Eureka Service Discovery
    EUREKA_HOST: process.env.EUREKA_HOST || 'localhost',
    EUREKA_PORT: parseInt(process.env.EUREKA_PORT || '8761', 10),

    // RabbitMQ (opcional)
    RABBITMQ_HOST: process.env.RABBITMQ_HOST || 'localhost',
    RABBITMQ_PORT: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    RABBITMQ_USER: process.env.RABBITMQ_USER || 'guest',
    RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || 'guest',
};