import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express'; // <-- NUEVO: Interfaz de Swagger
import swaggerDocument from './docs/swagger.json'; // <-- NUEVO: Nuestro documento JSON
import { envs } from './config/envs';
import './config/firebase';
import { pool } from './config/database'; 
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware'; 

const app: Application = express();

// --- 🛡️ SEGURIDAD PERIMETRAL ---
app.use(helmet());

// CORS Estricto: Solo permitimos a nuestro frontend de desarrollo y al dominio oficial
const allowedOrigins = ['http://localhost:5173', 'https://fococero.cl'];
app.use(cors({
    origin: (origin, callback) => {
        // Permitimos peticiones sin origin (como Postman) o si están en la lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Acceso denegado por políticas de CORS'));
        }
    },
    credentials: true // Permite envío de cookies/tokens si se requieren
}));

app.use(express.json());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50, 
    message: { error: 'Demasiadas peticiones desde esta IP. Por favor, intenta en 15 minutos.' }
});

// --- 🚦 RUTAS Y DOCUMENTACIÓN ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'ms-auth' });
});

// 📖 Ruta para la documentación interactiva de la API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', apiLimiter, authRoutes);
app.use(errorHandler);

// --- 🚀 INICIO DE SERVIDOR ---
const server = app.listen(envs.PORT, () => {
    console.log(`🚀 FocoCero Auth blindado y rodando en el puerto ${envs.PORT}`);
    console.log(`📖 Documentación disponible en: http://localhost:${envs.PORT}/api/docs`);
});

// --- 🛑 APAGADO ELEGANTE (GRACEFUL SHUTDOWN) ---
// Cuando Docker o el sistema operativo ordenen detener el servicio:
const gracefulShutdown = async () => {
    console.log('\n🛑 Recibida señal de apagado. Deteniendo tráfico HTTP...');
    
    server.close(async () => {
        console.log('✅ Servidor HTTP cerrado (no se aceptan nuevas peticiones).');
        try {
            console.log('🛑 Desconectando pool de PostgreSQL...');
            await pool.end(); // Cerramos la base de datos sin dejar conexiones colgadas
            console.log('✅ Base de datos desconectada. Apagado exitoso.');
            process.exit(0);
        } catch (err) {
            console.error('❌ Error al desconectar la base de datos:', err);
            process.exit(1);
        }
    });
};

// Escuchamos las señales de apagado
process.on('SIGTERM', gracefulShutdown); // Señal típica de Docker/Kubernetes
process.on('SIGINT', gracefulShutdown);  // Señal al presionar Ctrl+C en la terminal