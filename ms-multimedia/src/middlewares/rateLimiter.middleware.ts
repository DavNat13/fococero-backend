// ms-multimedia/src/middlewares/rateLimiter.middleware.ts

import rateLimit from 'express-rate-limit';

export const uploadRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5,
    message: {
        error: 'Demasiadas imágenes subidas. Por favor, espera un minuto antes de intentar nuevamente.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
