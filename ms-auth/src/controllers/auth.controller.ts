// ms-auth/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
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
            const newUser = await AuthService.registerFullUser(req.body);
            res.status(201).json({
                ok: true,
                msg: 'Cuenta FocoCero creada con éxito',
                usuario: newUser,
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
            // ✅ FIX: Casteo explícito a String primitivo
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
            // ✅ FIX: Casteo explícito a String primitivo
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
            // ✅ FIX: Casteo explícito a String primitivo
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
}
