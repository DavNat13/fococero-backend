import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { envs } from './config/envs';
import { pool } from './config/database';
import router from './routes/index.routes';
import { errorHandler } from './middlewares/error.middleware';
// import { initEurekaClient } from './config/eureka.client'; // Descomenta para Eureka

const app: Application = express();

// --- 🛡️ SEGURIDAD PERIMETRAL ---
app.use(helmet());
app.use(cors()); // En microservicios internos, el API Gateway maneja la seguridad
app.use(express.json());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Demasiadas peticiones desde esta IP.' },
});

// --- 🚦 RUTAS ---
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', service: 'ms-template' });
});

app.use('/api/v1', apiLimiter, router);
app.use(errorHandler);

// --- 🚀 INICIO DE SERVIDOR ---
const server = app.listen(envs.PORT, () => {
    console.log(`🚀 ms-template corriendo en puerto ${envs.PORT}`);
    console.log(`📡 Puerto: ${envs.PORT} | DB: PostgreSQL Conectada`);

    // --- 📡 EUREKA CLIENT (Descomenta cuando el servidor Eureka esté disponible) ---
    // initEurekaClient('ms-template', envs.PORT);
});

// --- 🛑 APAGADO ELEGANTE ---
const gracefulShutdown = async () => {
    console.log('\n🛑 Apagando servidor...');
    server.close(async () => {
        try {
            await pool.end();
            console.log('✅ Apagado exitoso.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error al desconectar DB:', err);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);