// src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---
import pool from './config/db';
import { envs } from './config/envs';
import './config/firebase';
import reporteRoutes from './routes/reporte.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();
app.set('trust proxy', 1);

// ============================================================================
// 📖 1. DOCUMENTACIÓN (SWAGGER)
// ============================================================================
import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// 🛡️ 2. SEGURIDAD PERIMETRAL Y PARSERS
// ============================================================================
app.use(helmet());

const allowedOrigins = ['http://localhost:5173', 'https://fococero.cl'];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Acceso denegado por políticas de CORS estricto'));
            }
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        ok: false,
        error: 'Demasiadas peticiones al sistema de reportes. Espere un momento.',
    },
});
app.use(limiter);

// ============================================================================
// 🚦 3. TEST DE VIDA (HEALTHCHECK)
// ============================================================================
// ✅ FIX: El Gateway recorta '/api/reportes', por lo que escuchamos en '/health'
// La URL externa seguirá siendo http://localhost:3000/api/reportes/health
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        status: 'UP',
        service: 'ms-reportes',
        timestamp: new Date().toISOString(),
    });
});

// ============================================================================
// 🛣️ 4. ENRUTAMIENTO PRINCIPAL
// ============================================================================
// ✅ FIX CRÍTICO: Escuchar en '/' porque el Gateway ya gestiona el prefijo
app.use('/', reporteRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada en ms-reportes' });
});

// ============================================================================
// 🚨 5. MANEJADOR DE ERRORES GLOBAL
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🚀 6. INICIALIZACIÓN DEL SERVIDOR
// ============================================================================
const server = app.listen(envs.PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🌍 MICROSERVICIO MS-REPORTES (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${envs.PORT}`);

    try {
        await pool.query('SELECT NOW()');
        console.log(`✅ Conexión a Base de Datos verificada exitosamente.`);
    } catch (error) {
        console.error(`⚠️ Advertencia: No se pudo verificar la base de datos al inicio.`, error);
    }

    console.log(`🛡️  Seguridad: Limitador y Escudos Activos`);
    console.log(`📖 Documentación: http://localhost:${envs.PORT}/api/docs`);
    console.log(`====================================================\n`);
});

// ============================================================================
// 🛑 7. APAGADO ELEGANTE
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Recibida señal de apagado (${signal})...`);
    server.close(async () => {
        try {
            await pool.end();
            process.exit(0);
        } catch (err) {
            process.exit(1);
        }
    });
    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
