// src/routes/geo.routes.ts

import { Router } from 'express';
import { GeoController } from '../controllers/geo.controller';
import { validateFirebaseToken } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import {
    crearFocoSchema,
    cambiarEstadoSchema,
    actualizarPerimetroSchema,
    actualizarFocoSchema, 
    queryCercanosSchema,
} from '../validators/geo.validator';

const router = Router();

// ============================================================================
// 🔓 ZONA PÚBLICA / CIUDADANA
// ============================================================================

router.post('/', validateSchema(crearFocoSchema), GeoController.reportarFoco);
router.get('/', GeoController.obtenerTodos);
router.get('/cercanos', validateSchema(queryCercanosSchema), GeoController.obtenerCercanos);
router.get('/:id', GeoController.obtenerPorId);

// ============================================================================
// 🛡️ BARRERA DE SEGURIDAD (Solo Personal Autorizado)
// ============================================================================
router.use(validateFirebaseToken);

// Gestión de estados y perímetros
router.patch('/:id/estado', validateSchema(cambiarEstadoSchema), GeoController.cambiarEstado);
router.patch(
    '/:id/perimetro',
    validateSchema(actualizarPerimetroSchema),
    GeoController.actualizarPerimetro,
);

router.put('/:id', validateSchema(actualizarFocoSchema), GeoController.actualizarCompleto);

router.delete('/:id', GeoController.eliminar);

export default router;
