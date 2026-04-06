// ==========================================
// 🚨 ENTRYPOINT: MS-ALERTAS (Corregido)
// ==========================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// --- IMPORTACIONES INTERNAS ---
import { pool, testDbConnection } from './config/database';
import './config/firebase';
import alertasRoutes from './routes/alerta.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.set('trust proxy', 1);

// 📖 1. DOCUMENTACIÓN
import * as swaggerDocument from './docs/swagger.json';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛡️ 2. SEGURIDAD PERIMETRAL
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        ok: false,
        error: 'Demasiadas alertas reportadas. Espere un momento para evitar spam.',
    },
});
app.use(limiter);

// 🛣️ 3. ENRUTAMIENTO PRINCIPAL
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', service: 'ms-alertas' });
});

// ✅ FIX CRÍTICO: Escuchar en la raíz porque el Gateway ya recorta '/api/alertas'
app.use('/', alertasRoutes);

// 🚨 4. MANEJADOR DE ERRORES GLOBAL
app.use(errorHandler);

// 🚀 5. INICIALIZACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🚨 MICROSERVICIO MS-ALERTAS (FocoCero) ACTIVADO`);
    console.log(`📡 Puerto: ${PORT}`);

    try {
        await testDbConnection();
    } catch (error) {
        console.error(
            `⚠️ Advertencia: No se pudo verificar la conexión a la BD de Alertas...`,
            error,
        );
    }
    console.log(`====================================================\n`);
});

// 🛑 6. APAGADO ELEGANTE
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
