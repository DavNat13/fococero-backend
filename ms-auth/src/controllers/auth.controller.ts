import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * AuthController: Capa de presentación para FocoCero.
 * Traduce las peticiones HTTP de la web/app móvil hacia el Service y formatea las respuestas.
 */
export class AuthController {
    
    // ============================================================================
    // 🟢 SECCIÓN: PÚBLICA (REGISTRO Y ACCESO)
    // ============================================================================

    /**
     * [POST] /register-guest
     * Registra a un ciudadano sin cuenta de Google.
     */
    static async registerGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await AuthService.registerGuestUser(req.body);
            
            if (!result.isNew) {
                res.status(200).json({ ok: true, msg: 'Usuario ya identificado en el sistema', usuario: result.user });
                return;
            }

            res.status(201).json({ ok: true, msg: 'Invitado registrado exitosamente', usuario: result.user });
        } catch (error: any) {
            if (error.message) {
                res.status(400).json({ ok: false, error: error.message });
                return;
            }
            next(error);
        }
    }

    /**
     * [POST] /register-full
     * Registra un usuario verificando su token criptográfico de Firebase.
     */
    static async registerFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newUser = await AuthService.registerFullUser(req.body);
            res.status(201).json({ ok: true, msg: 'Cuenta FocoCero creada con éxito', usuario: newUser });
        } catch (error: any) {
            if (error.message) {
                res.status(400).json({ ok: false, error: error.message });
                return;
            }
            next(error);
        }
    }

    // ============================================================================
    // 🔵 SECCIÓN: PRIVADA (MI PERFIL - Requiere Token)
    // ============================================================================

    /**
     * [GET] /me
     * Devuelve los datos del usuario logueado actualmente.
     */
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // El ID viene del auth.middleware (quien validó el token)
            const userId = (req as any).user.id; 
            
            const profile = await AuthService.getUserProfile(userId);
            res.status(200).json({ ok: true, perfil: profile });
        } catch (error: any) {
            res.status(404).json({ ok: false, error: error.message });
        }
    }

    /**
     * [PATCH] /me
     * Permite al usuario actualizar su propio nombre, apellido o teléfono.
     */
    static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const updatedUser = await AuthService.updateUserProfile(userId, req.body);
            
            res.status(200).json({ ok: true, msg: 'Perfil actualizado', usuario: updatedUser });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }

    /**
     * [PATCH] /me/fcm-token
     * Actualiza silenciosamente el token del celular para recibir notificaciones Push.
     */
    static async syncFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { fcm_token } = req.body;

            await AuthService.syncFcmToken(userId, fcm_token);
            res.status(200).json({ ok: true, msg: 'Canal de alertas push sincronizado' });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }

    // ============================================================================
    // 🔴 SECCIÓN: ADMINISTRATIVA (Solo Admins)
    // ============================================================================

    /**
     * [GET] /users
     * Lista a todos los usuarios registrados en FocoCero.
     */
    static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await AuthService.getAllUsersForAdmin();
            res.status(200).json({ ok: true, total: users.length, usuarios: users });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * [PATCH] /users/:id/role
     * Asciende o degrada a un usuario (Ej: Promover a Brigadista).
     */
    static async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(req.params.id as string, 10);
            const { rol } = req.body; // Se espera UserRole ("brigadista", "admin", etc.)

            const updatedUser = await AuthService.changeUserRole(targetUserId, rol);
            res.status(200).json({ ok: true, msg: 'Rol actualizado exitosamente', usuario: updatedUser });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }

    /**
     * [PATCH] /users/:id/status
     * Bloquea (BAN) o reactiva a un usuario.
     */
    static async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(req.params.id as string, 10);
            const { estado } = req.body; // Se espera UserStatus ("activo", "bloqueado", etc.)

            const updatedUser = await AuthService.updateUserStatus(targetUserId, estado);
            res.status(200).json({ ok: true, msg: 'Estado operativo modificado', usuario: updatedUser });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }

    /**
     * [DELETE] /users/:id
     * Elimina permanentemente a un usuario del sistema FocoCero.
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId = parseInt(req.params.id as string, 10);
            await AuthService.terminateUser(targetUserId);
            
            res.status(200).json({ ok: true, msg: `Usuario con ID ${targetUserId} eliminado definitivamente.` });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }
}