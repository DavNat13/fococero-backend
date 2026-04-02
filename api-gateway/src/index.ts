import { createProxyMiddleware } from 'http-proxy-middleware';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// --- 🛡️ SEGURIDAD Y LOGS ---
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// --- 🚦 CONFIGURACIÓN DE PROXIES ---

// Redirige a MS-AUTH (Puerto 3001)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
}));

// Redirige a MS-GEO (Puerto 3002)
app.use('/api/geo', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
}));

// Redirige a MS-ALERTAS (Puerto 3003)
app.use('/api/alertas', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
}));

// --- 🩺 PUNTO DE CONTROL ---
app.get('/health', (req, res) => {
    res.json({ 
        status: 'API Gateway UP', 
        services: ['ms-auth', 'ms-geo', 'ms-alertas'] 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway FocoCero funcionando en http://localhost:${PORT}`);
});