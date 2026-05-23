import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// ==========================================
// 🛣️ Ruta Principal del Microservicio
// ==========================================
// Aqui iran las rutas especificas del servicio
// example: router.use('/resource', exampleRoutes);

router.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'ms-template API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api/v1',
        },
    });
});

export default router;