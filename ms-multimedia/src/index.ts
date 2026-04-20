// ms-multimedia/src/index.ts

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// ==========================================
// CONFIGURACIONES E INICIALIZACIONES GLOBALES
// ==========================================
import { envs } from './config/envs';
import './config/db'; // Al importarlo, ejecuta la conexión al Pool de PostgreSQL
import './config/firebase'; // Al importarlo, inicializa la conexión con Google Cloud

// ==========================================
// RUTAS Y DOCUMENTACIÓN
// ==========================================
import multimediaRoutes from './routes/multimedia.routes';
import { swaggerSpec } from './docs/swagger';

import { iniciarBarrendero } from './cron/barrendero';

// ==========================================
// MIDDLEWARES PERSONALIZADOS
// ==========================================
import { errorHandler } from './middlewares/errorHandler';

// Inicializamos la aplicación de Express
const app: Application = express();

// ==========================================
// 1. MIDDLEWARES GLOBALES (Seguridad y Logs)
// ==========================================
// 🛡️ Helmet oculta información del servidor y bloquea ataques comunes (XSS, Clickjacking)
app.use(helmet());

// 🌐 CORS permite que el API Gateway o el Frontend puedan comunicarse con nosotros
app.use(cors());

// 📝 Morgan nos da un log visual en la consola de cada petición (ej. "POST /upload 201 45ms")
app.use(morgan('dev'));

// 📦 Parseadores básicos para JSON y URL-encoded (Multer se encarga del multipart/form-data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. DOCUMENTACIÓN (Swagger UI)
// ==========================================
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'FocoCero API - Multimedia',
        customCss: '.swagger-ui .topbar { display: none }', // Oculta la barra verde fea de Swagger
    }),
);

// ==========================================
// 3. RUTAS PRINCIPALES
// ==========================================
// Ruta "Healthcheck": Vital para Docker y Kubernetes para saber si el contenedor está vivo
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'ms-multimedia',
        timestamp: new Date().toISOString(),
    });
});

// Montamos todas nuestras rutas bajo el prefijo estándar de la API
app.use('/api/v1/multimedia', multimediaRoutes);

// ==========================================
// 4. RED DE SEGURIDAD (Manejador de Errores)
// ==========================================
// ⚠️ IMPORTANTE: Este middleware DEBE ir siempre al final, después de todas las rutas
app.use(errorHandler);

// ==========================================
// 5. ENCENDIDO DEL SERVIDOR
// ==========================================
const startServer = () => {
    app.listen(envs.PORT, () => {
        console.log('\n=============================================');
        console.log(`🚀 [ms-multimedia] Encendido y Operativo!`);
        console.log(`🌐 Ambiente: ${envs.NODE_ENV.toUpperCase()}`);
        console.log(`📡 Puerto: ${envs.PORT}`);
        console.log(`📚 Documentación: http://localhost:${envs.PORT}/api-docs`);
        console.log('=============================================\n');

        // Iniciamos el sistema de limpieza automática (Barrendero)
        iniciarBarrendero();
        console.log('=============================================\n');
    });
};

startServer();
