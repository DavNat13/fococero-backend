// src/index.ts

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---
import { pool, testDbConnection } from './config/database';
import './config/firebase'; // Inicializa Firebase Admin automáticamente
import geoRoutes from './routes/geo.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Le dice a Express que confíe en el proxy (ideal para Docker/Kubernetes)
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

// Limitador de peticiones para evitar ataques DDoS al motor espacial
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: { ok: false, error: 'Demasiadas peticiones al radar geográfico. Espere un momento.' },
});
app.use(limiter);

// ============================================================================
// 🛣️ 3. ENRUTAMIENTO PRINCIPAL
// ============================================================================
/**
 * FIJA EL 404: El Gateway ya redirige /api/geo a este microservicio.
 * Escuchamos en '/' para que las rutas internas (/cercanos, /:id) funcionen.
 */
app.use('/', geoRoutes);

// ============================================================================
// 🚨 4. MANEJADOR DE ERRORES GLOBAL (DEBE IR AL FINAL)
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🚀 5. INICIALIZACIÓN DEL SERVIDOR
// ============================================================================
const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🌍 MICROSERVICIO MS-GEO (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${PORT}`);

    try {
        await testDbConnection();
    } catch (error) {
        console.error(
            `⚠️ Advertencia: No se pudo verificar la base de datos al inicio. Detalle:`,
            error,
        );
    }

    console.log(`🛡️  Seguridad: Limitador y Escudos Activos`);
    console.log(`📖 Documentación: http://localhost:${PORT}/api/docs`);
    console.log(`====================================================\n`);
});

// ============================================================================
// 🛑 6. APAGADO ELEGANTE (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Recibida señal de apagado (${signal}). Deteniendo tráfico HTTP...`);

    server.close(async () => {
        console.log('✅ Servidor HTTP cerrado (no se aceptan nuevas peticiones).');
        try {
            console.log('🛑 Desconectando motor espacial PostgreSQL/PostGIS...');
            await pool.end();
            console.log('✅ Base de datos desconectada. Apagado exitoso del sistema.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error al desconectar la base de datos:', err);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('⚠️ Forzando el apagado tras 10 segundos de espera.');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
