// ==========================================
// 🛣️ RUTAS: MS-ALERTAS
// ==========================================

import { Router } from 'express';
import { AlertaController } from '../controllers/alerta.controller';

// 🛡️ Escudos de Seguridad
import { validateFirebaseToken } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.enum';

// 🚦 Validadores Zod
import { validateSchema } from '../middlewares/validate.middleware';
import { crearAlertaSchema, cambiarEstadoSchema } from '../validators/alerta.validator';

const router = Router();

// ============================================================================
// 🔒 ZONA SEGURA: Todas las rutas de alertas requieren estar autenticado
// ============================================================================
router.use(validateFirebaseToken);


// ============================================================================
// 🟢 🔵 ACCESO GENERAL (Cualquier usuario autenticado)
// ============================================================================

// POST /api/alertas -> Crear nueva alerta
router.post('/', validateSchema(crearAlertaSchema), AlertaController.crear);

// GET /api/alertas/mis-alertas -> Historial del ciudadano (Debe ir antes de /:id)
router.get('/mis-alertas', AlertaController.obtenerMisAlertas);

// GET /api/alertas/cercanas -> Obtener alertas en un radio (Debe ir antes de /:id)
router.get('/cercanas', AlertaController.obtenerCercanas);

// GET /api/alertas/:id -> Ver detalle de una alerta específica
router.get('/:id', AlertaController.obtenerPorId);


// ============================================================================
// 🟠 ACCESO OPERATIVO (Solo personal en terreno o comando: Brigadistas y Admins)
// ============================================================================

// GET /api/alertas -> Panel general de todas las alertas
router.get(
    '/',
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]),
    AlertaController.obtenerTodas
);

// POST /api/alertas/:id/verificar -> Endpoint táctico de confirmación en terreno
router.post(
    '/:id/verificar',
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]),
    AlertaController.verificar
);

// PATCH /api/alertas/:id/estado -> Actualiza a "EN_PROCESO", "RESUELTA", etc.
router.patch(
    '/:id/estado',
    authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]),
    validateSchema(cambiarEstadoSchema),
    AlertaController.cambiarEstado
);


// ============================================================================
// 🔴 ACCESO CRÍTICO (Solo Administradores)
// ============================================================================

// DELETE /api/alertas/:id -> Borrado lógico del mapa
router.delete(
    '/:id', 
    authorizeRole([UserRole.ADMIN]), 
    AlertaController.eliminar
);

export default router;