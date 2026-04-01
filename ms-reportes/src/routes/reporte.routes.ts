// src/routes/reporte.routes.ts

import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';

// Middlewares
import { validateFirebaseToken } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { validateSchema } from '../middlewares/validate.middleware';

// Validadores y Modelos
import { crearReporteSchema, cambiarEstadoSchema } from '../validators/reporte.validator';
import { UserRole } from '../models/user.enum';

const router = Router();

// ============================================================================
// 🛡️ BARRERA DE SEGURIDAD (Middleware Auth)
// ============================================================================
// ¡CRÍTICO! A partir de esta línea, Express exige un Token JWT válido.
router.use(validateFirebaseToken);


// ============================================================================
// 🔓 ZONA CIUDADANA (Acceso Básico)
// ============================================================================

/**
 * @route   POST /api/reportes
 * @desc    [BÁSICO] Crear un nuevo reporte de incidente
 * @body    { categoria_id, titulo, descripcion, latitud, longitud, metadata }
 */
router.post(
    '/', 
    validateSchema(crearReporteSchema), 
    ReporteController.crearReporte
);

/**
 * @route   GET /api/reportes
 * @desc    [BÁSICO] Obtener todos los reportes (Paginados)
 * @query   ?limit=10&offset=0
 */
router.get(
    '/', 
    ReporteController.obtenerReportes
);

/**
 * @route   GET /api/reportes/:id
 * @desc    [BÁSICO] Ver detalle completo de un reporte específico
 */
router.get(
    '/:id', 
    ReporteController.obtenerReportePorId
);


// ============================================================================
// 🔒 ZONA OPERATIVA (Gestión de Emergencias CONAF / Bomberos / Admins)
// ============================================================================

/**
 * @route   PATCH /api/reportes/:id/estado
 * @desc    [PRO] Cambiar el estado operativo de un reporte (Ej: 'PENDIENTE' -> 'RESUELTO')
 * @body    { nuevoEstado, comentarios }
 */
router.patch(
    '/:id/estado', 
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]), // 🛡️ Escudo de Rol
    validateSchema(cambiarEstadoSchema),                  // 🛡️ Escudo Zod
    ReporteController.cambiarEstado                       // 🧠 Cerebro
);

export default router;