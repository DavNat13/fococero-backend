import { Router } from 'express';
import { DespachoController } from '../controllers/despacho.controller';
import { validateSchema } from '../validators/validateSchema';
import { createDespachoSchema, updateStatusSchema } from '../validators/despacho.validator';

const router = Router();

/**
 * @route POST /api/v1/emergencias/despachos
 * @desc  Registrar y enviar despacho a organismo externo
 */
router.post('/', validateSchema(createDespachoSchema), DespachoController.create);

/**
 * @route POST /api/v1/emergencias/despachos/retry
 * @desc  Ejecutar reintentos de logs fallidos (Uso interno/Admin)
 */
router.post('/retry', DespachoController.retry);

/**
 * @route GET /api/v1/emergencias/despachos/:correlation_id
 * @desc  Consultar el estado de un despacho por su ID de correlación
 */
router.get('/:correlation_id', DespachoController.getStatus);

/**
 * @route PATCH /api/v1/emergencias/despachos/:id/estado
 * @desc  Actualizar estado (Webhooks o cancelaciones)
 */
router.patch('/:id/estado', validateSchema(updateStatusSchema), DespachoController.updateStatus);

export default router;
