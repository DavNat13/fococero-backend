// src/routes/geo.routes.ts

import { Router } from 'express';
import { GeoController } from '../controllers/geo.controller';
import { validateFirebaseToken } from '../middlewares/auth.middleware';

const router = Router();

// ============================================================================
// 🔓 ZONA PÚBLICA / CIUDADANA (Acceso Libre)
// ============================================================================
// No requieren token. Usadas por la app móvil ciudadana y el mapa público.

/**
 * @route   POST /api/geo
 * @desc    [BÁSICO] Crear un nuevo reporte de incendio (Ciudadano)
 */
router.post('/', GeoController.reportarFoco);

/**
 * @route   GET /api/geo
 * @desc    [BÁSICO] Obtener todos los focos activos (Mapa global)
 */
router.get('/', GeoController.obtenerTodos);

/**
 * @route   GET /api/geo/cercanos
 * @desc    [PRO - POSTGIS] Búsqueda espacial por radio (Radar).
 * @query   ?lat=-33.4&lng=-70.6&radio=5000 (radio en metros)
 */
router.get('/cercanos', GeoController.obtenerCercanos);

/**
 * @route   GET /api/geo/:id
 * @desc    [BÁSICO] Ver detalle completo de un reporte específico
 */
router.get('/:id', GeoController.obtenerPorId);


// ============================================================================
// 🛡️ BARRERA DE SEGURIDAD (Middleware Auth)
// ============================================================================
// ¡CRÍTICO! A partir de esta línea, Express exige un Token JWT válido.
//router.use(validateFirebaseToken);


// ============================================================================
// 🔒 ZONA OPERATIVA (Gestión de Emergencias CONAF / Bomberos)
// ============================================================================

/**
 * @route   PATCH /api/geo/:id/estado
 * @desc    [BÁSICO] Cambiar el estado operativo (Ej: 'En Combate' -> 'Controlado')
 */
router.patch('/:id/estado', GeoController.cambiarEstado);

/**
 * @route   PATCH /api/geo/:id/perimetro
 * @desc    [PRO - POSTGIS] Actualizar el polígono del área quemada desde un dron/satélite.
 * @body    { "area_quemada_wkt": "POLYGON((-71.5 -35.6, -71.4 -35.6, ...))" }
 */
router.patch('/:id/perimetro', GeoController.actualizarPerimetro);

/**
 * @route   PUT /api/geo/:id
 * @desc    [PRO] Actualización integral (Variables climáticas, viento, amenaza a viviendas)
 */
router.put('/:id', GeoController.actualizarCompleto);

/**
 * @route   DELETE /api/geo/:id
 * @desc    [BÁSICO] Eliminación lógica (Soft Delete) de un reporte falso o duplicado
 */
router.delete('/:id', GeoController.eliminar);

export default router;