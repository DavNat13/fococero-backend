// ms-auth/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthValidator } from '../validators/auth.validator';
import { AppError } from '../helpers/appError';

export class AuthController {
    // --- 🟢 SECCIÓN: PÚBLICA ---
    static async registerGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await AuthService.registerGuestUser(req.body);
            const statusCode = result.isNew ? 201 : 200;
            const msg = result.isNew
                ? 'Usuario registrado exitosamente'
                : 'Usuario ya identificado en el sistema';

            res.status(statusCode).json({ ok: true, msg, usuario: result.user });
        } catch (error) {
            next(error);
        }
    }

    static async registerFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await AuthService.registerFullUser(req.body);
            res.status(201).json({
                ok: true,
                msg: 'Cuenta FocoCero creada con éxito',
                usuario: result.user,
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await AuthService.loginUser(req.body);
            res.status(200).json({
                ok: true,
                msg: 'Inicio de sesión exitoso',
                usuario: result.user,
                firebaseToken: result.firebaseToken,
            });
        } catch (error) {
            next(error);
        }
    }

    static async loginWithGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                throw new AppError('Cuerpo de solicitud inválido.', 400);
            }
            const result = await AuthService.loginWithGoogle(req.body);
            res.status(200).json({
                ok: true,
                msg: 'Autenticación con Google exitosa',
                usuario: result.user,
            });
        } catch (error) {
            next(error);
        }
    }

    // --- 🔵 SECCIÓN: PRIVADA ---
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id!;
            const profile = await AuthService.getUserProfile(userId);
            res.status(200).json({ ok: true, perfil: profile });
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id!;
            const updatedUser = await AuthService.updateUserProfile(userId, req.body);
            res.status(200).json({ ok: true, msg: 'Perfil actualizado', usuario: updatedUser });
        } catch (error) {
            next(error);
        }
    }

    static async syncFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id!;
            await AuthService.syncFcmToken(userId, req.body.fcm_token);
            res.status(200).json({ ok: true, msg: 'Canal de alertas push sincronizado' });
        } catch (error) {
            next(error);
        }
    }

    static async upgradeAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.firebase_uid) {
                throw new AppError('Usuario no autenticado con Firebase.', 401);
            }
            const updated = await AuthService.upgradeAccount(
                req.user.firebase_uid,
                req.body.password,
            );
            res.status(200).json({ ok: true, msg: 'Contraseña establecida exitosamente', usuario: updated });
        } catch (error) {
            next(error);
        }
    }

    static async convertToCiudadano(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.firebase_uid) {
                throw new AppError('Usuario no autenticado con Firebase.', 401);
            }
            const result = await AuthService.convertGuestToCitizen(
                req.user.firebase_uid,
                req.body.password,
            );
            res.status(200).json({
                ok: true,
                msg: 'Cuenta convertida a ciudadano exitosamente',
                usuario: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id!;
            const stats = await AuthService.getUserStats(userId);
            res.status(200).json({ ok: true, ...stats });
        } catch (error) {
            next(error);
        }
    }

    static async getMyPerfilBrigadista(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id!;
            const perfil = await AuthService.getPerfilBrigadista(userId);
            res.status(200).json({ ok: true, perfil });
        } catch (error) {
            next(error);
        }
    }

    static async updateMyPerfilBrigadista(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validation = AuthValidator.validatePerfilBrigadista(req.body);
            if (!validation.isValid) {
                throw new AppError(validation.error || 'Datos de perfil inválidos', 400);
            }
            const userId = req.user!.id!;
            const result = await AuthService.updatePerfilBrigadista(userId, req.body);
            res.status(200).json({
                ok: true,
                msg: 'Perfil de brigadista actualizado',
                perfil: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({ ok: true, data: [] });
        } catch (error) {
            next(error);
        }
    }

    // --- 🔴 SECCIÓN: ADMINISTRATIVA ---
    static async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await AuthService.getAllUsersForAdmin();
            res.status(200).json({ ok: true, total: users.length, usuarios: users });
        } catch (error) {
            next(error);
        }
    }

    static async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(String(req.params.id), 10);
            if (isNaN(targetUserId) || targetUserId <= 0) {
                throw new AppError('ID de usuario inválido', 400);
            }
            const updatedUser = await AuthService.changeUserRole(targetUserId, req.body.rol);
            res.status(200).json({
                ok: true,
                msg: 'Rol actualizado exitosamente',
                usuario: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    static async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(String(req.params.id), 10);
            if (isNaN(targetUserId) || targetUserId <= 0) {
                throw new AppError('ID de usuario inválido', 400);
            }
            const updatedUser = await AuthService.updateUserStatus(targetUserId, req.body.estado);
            res.status(200).json({
                ok: true,
                msg: 'Estado operativo modificado',
                usuario: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(String(req.params.id), 10);
            if (isNaN(targetUserId) || targetUserId <= 0) {
                throw new AppError('ID de usuario inválido', 400);
            }
            await AuthService.terminateUser(targetUserId);
            res.status(200).json({
                ok: true,
                msg: `Usuario con ID ${targetUserId} eliminado definitivamente.`,
            });
        } catch (error) {
            next(error);
        }
    }

    static async adminCreateBrigadista(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(String(req.params.id), 10);
            if (isNaN(targetUserId) || targetUserId <= 0) {
                throw new AppError('ID de usuario inválido', 400);
            }
            const result = await AuthService.adminCreateBrigadista(targetUserId, req.body);
            res.status(201).json({
                ok: true,
                msg: 'Brigadista creado exitosamente',
                usuario: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
