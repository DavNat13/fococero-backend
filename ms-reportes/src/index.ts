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
// 📖 1. DOCUMENTACIÓN Y MAPA DE BATALLA (SWAGGER)
// ============================================================================

import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ============================================================================
// 🛡️ 2. SEGURIDAD PERIMETRAL Y PARSERS
// ============================================================================

app.use(helmet());

// CORS Estricto (Adaptado a tus entornos)
const allowedOrigins = ['http://localhost:5173', 'https://fococero.cl'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Acceso denegado por políticas de CORS estricto'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones
app.use(morgan('dev'));

// Limitador de peticiones para evitar ataques DDoS al sistema
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { ok: false, error: 'Demasiadas peticiones al sistema de reportes. Espere un momento.' }
});
app.use(limiter);


// ============================================================================
// 🚦 3. TEST DE VIDA (HEALTHCHECK)
// ============================================================================

app.get('/api/reportes/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        status: 'UP', 
        service: 'ms-reportes',
        port: envs.PORT,
        timestamp: new Date().toISOString() 
    });
});


// ============================================================================
// 🛣️ 4. ENRUTAMIENTO PRINCIPAL
// ============================================================================

app.use('/api/reportes', reporteRoutes);

// Manejador de rutas no encontradas (404)
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada en ms-reportes' });
});


// ============================================================================
// 🚨 5. MANEJADOR DE ERRORES GLOBAL (DEBE IR AL FINAL)
// ============================================================================
app.use(errorHandler);


// ============================================================================
// 🚀 6. INICIALIZACIÓN DEL SERVIDOR
// ============================================================================
const server = app.listen(envs.PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🌍 MICROSERVICIO MS-REPORTES (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${envs.PORT}`);
    
    // Verificamos que el motor espacial/PostgreSQL esté operativo
    try {
        await pool.query('SELECT NOW()');
        console.log(`✅ Conexión a Base de Datos verificada exitosamente.`);
    } catch (error) {
        console.error(`⚠️ Advertencia: No se pudo verificar la base de datos al inicio. Detalle:`, error);
    }

    console.log(`🛡️  Seguridad: Limitador y Escudos Activos`);
    console.log(`📍 Healthcheck: http://localhost:${envs.PORT}/api/reportes/health`);
    console.log(`📖 Documentación: http://localhost:${envs.PORT}/api/docs`);
    console.log(`====================================================\n`);
});


// ============================================================================
// 🛑 7. APAGADO ELEGANTE (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Recibida señal de apagado (${signal}). Deteniendo tráfico HTTP...`);

    server.close(async () => {
        console.log('✅ Servidor HTTP cerrado (no se aceptan nuevas peticiones).');
        try {
            console.log('🛑 Desconectando motor PostgreSQL/PostGIS...');
            await pool.end();
            console.log('✅ Base de datos desconectada. Apagado exitoso del sistema.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error al desconectar la base de datos:', err);
            process.exit(1);
        }
    });

    // Si las peticiones tardan más de 10 segundos en terminar, forzamos el apagado
    setTimeout(() => {
        console.error('⚠️ Forzando el apagado tras 10 segundos de espera.');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));