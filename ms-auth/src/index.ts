import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import './config/database'; // Importamos para que arranque la conexión a BD

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/auth', authRoutes);

// Ruta de Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ ok: true, service: 'ms-auth' });
});

app.listen(PORT, () => {
    console.log(`🚀 ms-auth ejecutándose en http://localhost:${PORT}`);
});