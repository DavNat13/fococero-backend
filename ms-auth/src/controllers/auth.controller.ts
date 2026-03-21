import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    
    static async registerGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Mandamos los datos al servicio (la capa lógica)
            const result = await AuthService.registerGuestUser(req.body);
            
            if (!result.isNew) {
                res.status(200).json({ ok: true, msg: 'Usuario ya identificado', usuario: result.user });
                return;
            }

            res.status(201).json({ ok: true, msg: 'Invitado registrado', usuario: result.user });
        } catch (error: any) {
            // Si es un error de validación nuestro (ej. "RUT inválido"), respondemos con 400
            if (error.message) {
                res.status(400).json({ ok: false, msg: error.message });
                return;
            }
            // Si es un error crítico del servidor, lo pasamos al Global Error Handler
            next(error);
        }
    }

    static async registerFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // El servicio procesa el Token de Firebase
            const newUser = await AuthService.registerFullUser(req.body);
            res.status(201).json({ ok: true, msg: 'Cuenta creada con éxito', usuario: newUser });
        } catch (error: any) {
            if (error.message) {
                res.status(400).json({ ok: false, msg: error.message });
                return;
            }
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({ ok: true, msg: 'Servicio de autenticación en línea' });
        } catch (error: any) {
            next(error);
        }
    }
}