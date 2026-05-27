import { Router } from 'express';
import despachoRoutes from './despacho.routes';

const router = Router();

router.use('/despachos', despachoRoutes);

export default router;
