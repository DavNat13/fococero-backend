// ms-alertas/src/index.ts

// ==========================================
// 🚨 ENTRYPOINT: MS-ALERTAS (Production-Ready)
// ==========================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---\
import { envs } from './config/envs';
import { pool, testDbConnection } from './config/database';
import './config/firebase'; // Inicializa Firebase Admin automáticamente
import alertasRoutes from './routes/alerta.routes';
import { errorHandler } from './middlewares/error.middleware';

import { initEurekaClient } from './config/eureka.client.js';

const app: Application = express();

// Confía en el proxy (vital si luego usas Docker Swarm, Nginx o Kubernetes)
app.set('trust proxy', 1);

// ============================================================================
// 📖 1. DOCUMENTACIÓN Y MAPA DE BATALLA (SWAGGER)
// ============================================================================
import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// 🛡️ 2. SEGURIDAD PERIMETRAL Y PARSERS
// ============================================================================
app.use(helmet());
app.use(cors());

// CRÍTICO: Permite a Express leer JSON y URL-encoded en los POST/PATCH
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones (Morgan)
app.use(morgan('dev'));

// Limitador de peticiones para evitar ataques de spam de alertas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: {
        ok: false,
        error: 'Demasiadas alertas reportadas. Espere un momento para evitar spam.',
    },
});
app.use(limiter);

// ============================================================================
// 🛣️ 3. ENRUTAMIENTO PRINCIPAL
// ============================================================================
// Endpoint de Salud (Requerido por nuestro test de Jest)
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', service: 'ms-alertas', environment: envs.NODE_ENV });
});

app.use('/', alertasRoutes);

// ============================================================================
// 🚨 4. MANEJADOR DE ERRORES GLOBAL (DEBE IR AL FINAL)
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🚀 5. INICIALIZACIÓN DEL SERVIDOR
const PORT = envs.PORT;

const server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🚨 MICROSERVICIO MS-ALERTAS (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);

    // Verificamos que el motor de base de datos esté operativo
    try {
        await testDbConnection();
    } catch (error) {
        console.error(
            `⚠️ Advertencia: No se pudo verificar la conexión a la BD de Alertas al inicio. Detalle:`,
            error,
        );
    }

    console.log(`🛡️  Seguridad: Limitador y Escudos Activos`);
    console.log(`📖 Documentación: http://localhost:${PORT}/api/docs`);
    console.log(`====================================================\n`);
    initEurekaClient('ms-alertas', PORT as number);
});

// ============================================================================
// 🛑 6. APAGADO ELEGANTE (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Recibida señal de apagado (${signal}). Cerrando ms-alertas...`);
    try {
        await pool.end();
        console.log('✅ Conexiones a la base de datos cerradas.');
    } catch (err) {
        console.error('❌ Error al cerrar conexiones DB:', err);
    }

    server.close(() => {
        console.log('✅ Servidor HTTP detenido. Adiós.');
        process.exit(0);
    });

    // Fallback de seguridad por si una conexión se queda colgada
    setTimeout(() => {
        console.error('❌ Cierre forzado por Timeout tras 10s.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
