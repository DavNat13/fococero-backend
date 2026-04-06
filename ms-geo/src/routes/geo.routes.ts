// src/routes/geo.routes.ts

import { Router, Response, NextFunction, Request } from 'express';
import { GeoController } from '../controllers/geo.controller';
import { validateFirebaseToken } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.enum';

interface AuthRequest extends Omit<Request, 'user'> {
    user?: {
        id: number;
        firebase_uid: string;
        email: string;
        rol: UserRole;
        estado: string;
    };
}

const router = Router();

const checkRole = (rolesPermitidos: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user || !rolesPermitidos.includes(user.rol)) {
            return res.status(403).json({
                ok: false,
                msg: `Permisos insuficientes. Requiere: ${rolesPermitidos.join('/')}`,
            });
        }
        next();
    };
};

// 🔓 PÚBLICO: Mapa y Radar
router.get('/', GeoController.obtenerTodos);
router.get('/cercanos', GeoController.obtenerCercanos);
router.get('/:id', GeoController.obtenerPorId);

// 🛡️ BARRERA: Solo usuarios autenticados e hidratados
router.use(validateFirebaseToken);

// 🔒 CIUDADANO: Reportar
router.post('/', GeoController.reportarFoco);

// 🔴 TÁCTICO: Brigadistas y Admins
const staff = [UserRole.ADMIN, UserRole.BRIGADISTA];
router.patch('/:id/estado', checkRole(staff), GeoController.cambiarEstado);
router.patch('/:id/perimetro', checkRole(staff), GeoController.actualizarPerimetro);
router.put('/:id', checkRole(staff), GeoController.actualizarCompleto);
router.delete('/:id', checkRole([UserRole.ADMIN]), GeoController.eliminar);

export default router;
