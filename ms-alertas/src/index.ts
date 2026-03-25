import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { envs } from './config/envs';
import { pool } from './config/database';
import alertaRoutes from './routes/alerta.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'https://fococero.cl'], credentials: true }));
app.use(express.json());

// Rutas base
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'ms-alertas' });
});

app.use('/api/alertas', alertaRoutes);

const server = app.listen(envs.PORT, () => {
    console.log(`🚀 FocoCero Alertas activo en puerto ${envs.PORT}`);
});

// Graceful Shutdown (Mismo que ms-auth para evitar conexiones colgadas)
const gracefulShutdown = async () => {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);