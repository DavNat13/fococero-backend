<<<<<<< Updated upstream
import { createProxyMiddleware } from 'http-proxy-middleware';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();
=======
// api-gateway/src/index.ts

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression"; // Recomendado: npm install compression
import swaggerUi from "swagger-ui-express";

import "./config/firebase";
import { envs } from "./config/envs";
import { globalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { appRoutes } from "./routes/routes";
import { swaggerDocument } from "./docs/swagger";
>>>>>>> Stashed changes

const app: Application = express();
const PORT = process.env.PORT || 3000;

<<<<<<< Updated upstream
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
=======
/**
 * CONFIGURACIÓN DE PROXY
 * Vital para que el Gateway reconozca las IPs reales de los usuarios
 * a través de Docker.
 */
app.set("trust proxy", 1);

// ============================================================================
// 🛡️ MIDDLEWARES GLOBALES (Optimización de Rendimiento y Seguridad)
// ============================================================================
app.use(helmet()); // Protege contra vulnerabilidades web comunes
app.use(cors()); // Permite que tu App móvil y Web se conecten
app.use(compression()); // Reduce el tamaño de las respuestas (Ahorra datos móviles)
app.use(morgan("dev")); // Log de peticiones en consola

// Limitador global de tráfico para evitar ataques de fuerza bruta
app.use(globalLimiter);

// ============================================================================
// 📖 DOCUMENTACIÓN CENTRALIZADA
// ============================================================================
// Disponible en: http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// 🚦 RUTAS (EL CORAZÓN DEL GATEWAY)
// ============================================================================

app.use(appRoutes);

// ============================================================================
// 🚨 GESTIÓN DE ERRORES (Al final de todo)
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🚀 INICIO DEL SERVIDOR Y APAGADO ELEGANTE
// ============================================================================
const server = app.listen(envs.PORT, () => {
  console.log(`\n====================================================`);
  console.log(`🚀 FOCOCERO API GATEWAY ACTIVADO`);
  console.log(`📡 Puerto: ${envs.PORT}`);
  console.log(`📖 Documentación: http://localhost:${envs.PORT}/api-docs`);
  console.log(`====================================================\n`);
});

/**
 * GRACEFUL SHUTDOWN (Apagado Limpio)
 * Evita que las peticiones en curso se corten abruptamente al reiniciar Docker.
 */
const shutdown = (signal: string) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando Gateway...`);
  server.close(() => {
    console.log("✅ Gateway cerrado correctamente. Adios!");
    process.exit(0);
  });

  // Si no cierra en 10s, forzamos
  setTimeout(() => {
    console.error("⚠️ Forzando apagado del Gateway.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
>>>>>>> Stashed changes
