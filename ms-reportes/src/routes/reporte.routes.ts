// src/routes/reporte.routes.ts
import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { validateFirebaseToken } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import {
    crearReporteSchema,
    cambiarEstadoSchema,
    actualizarReporteSchema,
    eliminarReporteSchema,
} from '../validators/reporte.validator';
import { UserRole } from '../models/user.enum';

const router = Router();

router.use(validateFirebaseToken);

// --- CATEGORÍAS ---
router.get('/categorias', ReporteController.obtenerCategorias);

// --- ZONA CIUDADANA ---
router.post('/', validateSchema(crearReporteSchema), ReporteController.crearReporte);
router.get('/', ReporteController.obtenerReportes);
router.get('/me', ReporteController.obtenerMisReportes);
router.get('/:id', ReporteController.obtenerReportePorId);
router.patch('/:id', validateSchema(actualizarReporteSchema), ReporteController.actualizarReporte);
router.delete('/:id', validateSchema(eliminarReporteSchema), ReporteController.eliminarReporte);

// --- ZONA OPERATIVA ---
router.get(
    '/:id/historial',
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]),
    ReporteController.obtenerHistorial,
);
router.patch(
    '/:id/estado',
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]),
    validateSchema(cambiarEstadoSchema),
    ReporteController.cambiarEstado,
);

export default router;
//
