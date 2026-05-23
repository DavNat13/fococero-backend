import { Router } from 'express';
import despachoRoutes from './despacho.routes';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @section Infraestructura & Monitoreo
 * Endpoint para Health Checks de Docker/Kubernetes y verificación de DB.
 */
router.get('/health', HealthController.check);

/**
 * @section Rutas de Negocio
 * Prefijo: /api/v1/emergencias/despachos (configurado en app.ts)
 * Aquí delegamos toda la lógica de gestión de alertas a organismos.
 */
router.use('/despachos', despachoRoutes);

export default router;
