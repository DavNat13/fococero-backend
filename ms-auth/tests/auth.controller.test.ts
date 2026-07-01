/**
 * Pruebas unitarias para AuthController
 *
 * @module auth.controller
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mocks before imports
jest.mock('../src/config/firebase', () => ({
    __esModule: true,
    default: {
        auth: () => ({
            verifyIdToken: jest.fn(),
            createCustomToken: jest.fn(),
            setCustomUserClaims: jest.fn(),
        }),
    },
}));

jest.mock('../src/services/auth.service');

import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/services/auth.service';
import { AppError } from '../src/helpers/appError';
import { UserRole } from '../src/models/user.enum';

const MockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthController - Controlador de autenticación', () => {
    let req: any;
    let res: any;
    let next: any;
    let jsonMock: any;
    let statusMock: any;

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = { body: {}, params: {}, user: undefined };
        res = { status: statusMock };
        next = jest.fn();
    });

    // ============================================================================
    // login
    // ============================================================================
    describe('login', () => {
        it('✅ debería iniciar sesión exitosamente', async () => {
            MockAuthService.loginUser.mockResolvedValue({
                user: { id: 1, nombre: 'Juan' } as any,
                firebaseToken: 'custom-token',
            });
            req.body = { rut: '12.345.678-5', password: 'secreta123' };

            await AuthController.login(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ ok: true, msg: 'Inicio de sesión exitoso' }),
            );
        });

        it('✅ debería delegar error al next', async () => {
            const error = new AppError('Error DB', 500);
            MockAuthService.loginUser.mockRejectedValue(error);
            req.body = { rut: '12.345.678-5', password: 'secreta123' };

            await AuthController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ============================================================================
    // registerGuest
    // ============================================================================
    describe('registerGuest', () => {
        it('✅ debería registrar invitado (nuevo)', async () => {
            MockAuthService.registerGuestUser.mockResolvedValue({
                isNew: true,
                user: { id: 1, nombre: 'Juan' } as any,
                firebaseToken: 'token',
            } as any);

            await AuthController.registerGuest(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it('✅ debería retornar 200 si el usuario ya existe', async () => {
            MockAuthService.registerGuestUser.mockResolvedValue({
                isNew: false,
                user: { id: 1 } as any,
            } as any);

            await AuthController.registerGuest(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // upgradeAccount
    // ============================================================================
    describe('upgradeAccount', () => {
        it('✅ debería actualizar contraseña', async () => {
            req.user = { firebase_uid: 'uid-123' };
            req.body = { password: 'new-password' };
            MockAuthService.upgradeAccount.mockResolvedValue({ id: 1 } as any);

            await AuthController.upgradeAccount(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });

        it('❌ debería lanzar error si no hay firebase_uid', async () => {
            req.user = undefined;

            await AuthController.upgradeAccount(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    // ============================================================================
    // loginWithGoogle
    // ============================================================================
    describe('loginWithGoogle', () => {
        it('✅ debería autenticar con Google exitosamente', async () => {
            req.body = { token: 'google-token' };
            MockAuthService.loginWithGoogle.mockResolvedValue({
                user: { id: 1, nombre: 'Google User' } as any,
            });

            await AuthController.loginWithGoogle(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });

        it('❌ debería rechazar body inválido (undefined)', async () => {
            req.body = undefined;

            await AuthController.loginWithGoogle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('❌ debería rechazar body que es un array', async () => {
            req.body = [];

            await AuthController.loginWithGoogle(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    // ============================================================================
    // registerFull
    // ============================================================================
    describe('registerFull', () => {
        it('✅ debería registrar usuario completo', async () => {
            req.body = {
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
                token: 'firebase-token',
            };
            MockAuthService.registerFullUser.mockResolvedValue({
                user: { id: 1, nombre: 'Juan' } as any,
            });

            await AuthController.registerFull(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(201);
        });
    });

    // ============================================================================
    // getProfile
    // ============================================================================
    describe('getProfile', () => {
        it('✅ debería retornar perfil del usuario', async () => {
            req.user = { id: 1 };
            MockAuthService.getUserProfile.mockResolvedValue({ id: 1, nombre: 'Juan' } as any);

            await AuthController.getProfile(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });
    });

    // ============================================================================
    // updateProfile
    // ============================================================================
    describe('updateProfile', () => {
        it('✅ debería actualizar perfil', async () => {
            req.user = { id: 1 };
            req.body = { nombre: 'NuevoNombre' };
            MockAuthService.updateUserProfile.mockResolvedValue({
                id: 1,
                nombre: 'NuevoNombre',
            } as any);

            await AuthController.updateProfile(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // syncFcmToken
    // ============================================================================
    describe('syncFcmToken', () => {
        it('✅ debería sincronizar token FCM', async () => {
            req.user = { id: 1 };
            req.body = { fcmToken: 'valid-fcm-token' };
            MockAuthService.syncFcmToken.mockResolvedValue(undefined);

            await AuthController.syncFcmToken(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // getMyStats
    // ============================================================================
    describe('getMyStats', () => {
        it('✅ debería retornar estadísticas', async () => {
            req.user = { id: 1 };
            MockAuthService.getUserStats.mockResolvedValue({
                totalReportes: 5,
                alertasActivas: 2,
            } as any);

            await AuthController.getMyStats(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // convertToCiudadano
    // ============================================================================
    describe('convertToCiudadano', () => {
        it('✅ debería convertir invitado a ciudadano', async () => {
            req.user = { firebase_uid: 'uid-123' };
            req.body = { password: 'new-password' };
            MockAuthService.convertGuestToCitizen.mockResolvedValue({
                id: 1,
                rol: UserRole.USUARIO,
            } as any);

            await AuthController.convertToCiudadano(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // ADMIN: getAllUsers
    // ============================================================================
    describe('getAllUsers', () => {
        it('✅ debería listar todos los usuarios', async () => {
            MockAuthService.getAllUsersForAdmin.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);

            await AuthController.getAllUsers(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true, total: 2 }));
        });
    });

    // ============================================================================
    // ADMIN: changeRole
    // ============================================================================
    describe('changeRole', () => {
        it('✅ debería cambiar rol de usuario', async () => {
            req.params = { id: '1' };
            req.body = { rol: UserRole.ADMIN };
            MockAuthService.changeUserRole.mockResolvedValue({ id: 1, rol: UserRole.ADMIN } as any);

            await AuthController.changeRole(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });

        it('❌ debería rechazar ID inválido', async () => {
            req.params = { id: 'abc' };

            await AuthController.changeRole(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    // ============================================================================
    // ADMIN: changeStatus
    // ============================================================================
    describe('changeStatus', () => {
        it('✅ debería cambiar estado de usuario', async () => {
            req.params = { id: '1' };
            req.body = { estado: 'bloqueado' };
            MockAuthService.updateUserStatus.mockResolvedValue({
                id: 1,
                estado: 'bloqueado',
            } as any);

            await AuthController.changeStatus(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // ADMIN: deleteUser
    // ============================================================================
    describe('deleteUser', () => {
        it('✅ debería eliminar usuario', async () => {
            req.params = { id: '1' };
            MockAuthService.terminateUser.mockResolvedValue(true);

            await AuthController.deleteUser(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    // ============================================================================
    // Perfil Brigadista
    // ============================================================================
    describe('getMyPerfilBrigadista', () => {
        it('✅ debería retornar perfil brigadista', async () => {
            req.user = { id: 1 };
            MockAuthService.getPerfilBrigadista.mockResolvedValue({
                id: 1,
                perfil_brigadista: { organismo: 'Bomberos' },
            } as any);

            await AuthController.getMyPerfilBrigadista(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe('updateMyPerfilBrigadista', () => {
        it('✅ debería actualizar perfil brigadista', async () => {
            req.user = { id: 1 };
            req.body = { organismo: 'CONAF' };
            MockAuthService.updatePerfilBrigadista.mockResolvedValue({
                id: 1,
                perfil_brigadista: { organismo: 'CONAF' },
            } as any);

            await AuthController.updateMyPerfilBrigadista(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
        });

        it('❌ debería rechazar datos inválidos (organismo corto)', async () => {
            req.user = { id: 1 };
            req.body = { organismo: 'A' };
            // The validator checks before calling service
            // This should go through the validator and throw

            await AuthController.updateMyPerfilBrigadista(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('adminCreateBrigadista', () => {
        it('✅ debería crear brigadista (admin)', async () => {
            req.params = { id: '1' };
            req.body = { organismo: 'Bomberos' };
            MockAuthService.adminCreateBrigadista.mockResolvedValue({
                id: 1,
                perfil_brigadista: { organismo: 'Bomberos' },
            } as any);

            await AuthController.adminCreateBrigadista(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it('❌ debería rechazar ID inválido', async () => {
            req.params = { id: '-1' };

            await AuthController.adminCreateBrigadista(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    // ============================================================================
    // getMyNotifications
    // ============================================================================
    describe('getMyNotifications', () => {
        it('✅ debería retornar lista vacía de notificaciones', async () => {
            await AuthController.getMyNotifications(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ ok: true, data: [] });
        });
    });
});
