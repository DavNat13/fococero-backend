// ms-multimedia/src/routes/multimedia.routes.ts

import { Router } from 'express';
import { MultimediaController } from '../controllers/multimedia.controller';

// Middlewares
import { requireGatewayAuth } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';
import { validateSchema } from '../middlewares/validate.middleware';

import { uploadValidator, idParamValidator } from '../validators/multimedia.validator';

const router = Router();

// Endpoint 1: Subir (Nace Huérfano)
router.post(
    '/upload',
    requireGatewayAuth,
    uploadRateLimiter,
    uploadMiddleware.single('archivo'),
    validateSchema(uploadValidator),
    MultimediaController.subirArchivo,
);

// Endpoint 2: Vincular (Adopción)
router.patch(
    '/:id/vincular',
    requireGatewayAuth,
    validateSchema(idParamValidator),
    MultimediaController.vincularArchivo,
);

// Endpoint 3: Eliminar (Soft Delete)
router.delete(
    '/:id',
    requireGatewayAuth,
    validateSchema(idParamValidator),
    MultimediaController.eliminarArchivo,
);

// Endpoint 4: Limpieza interna
router.get('/internal/cleanup', MultimediaController.limpiarHuerfanos);

export default router;
