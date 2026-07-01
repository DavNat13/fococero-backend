/**
 * Pruebas unitarias para AuthService
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../src/services/auth.service';
import { AppError } from '../src/helpers/appError';
import { UserRole, UserStatus } from '../src/models/user.enum';

// ============================================================================
// Mocks inline (evita problema de hoisting con const)
// ============================================================================
jest.mock('../src/config/firebase', () => {
    // auth internamente mutable - siempre retorna el mismo objeto
    const auth = {
        verifyIdToken: jest.fn(),
        createCustomToken: jest.fn(),
        setCustomUserClaims: jest.fn(),
    };
    return { __esModule: true, default: { auth: () => auth } };
});

jest.mock('../src/repositories/user.repository', () => ({
    UserRepository: {
        findByRut: jest.fn(),
        findByFirebaseUid: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        findByFirebaseUidOrRut: jest.fn(),
        findAll: jest.fn(),
        createGuest: jest.fn(),
        createFullUser: jest.fn(),
        update: jest.fn(),
        updateFirebaseUid: jest.fn(),
        updateFcmToken: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('../src/repositories/perfil-brigadista.repository', () => ({
    PerfilBrigadistaRepository: {
        findByUsuarioId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(() => Promise.resolve(true)),
    genSalt: jest.fn(() => Promise.resolve('salt')),
    hash: jest.fn(() => Promise.resolve('hashed-password')),
}));

// ============================================================================
// Referencias a los mocks via requireMock
// ============================================================================
function getFirebaseMock(): any {
    return (jest.requireMock('../src/config/firebase') as any).default.auth();
}

function getUserRepoMock(): any {
    return (jest.requireMock('../src/repositories/user.repository') as any).UserRepository;
}

function getPerfilRepoMock(): any {
    return (jest.requireMock('../src/repositories/perfil-brigadista.repository') as any)
        .PerfilBrigadistaRepository;
}

function getBcryptMock(): any {
    return jest.requireMock('bcryptjs') as any;
}

describe('AuthService - Servicio de autenticación', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============================================================================
    // loginUser
    // ============================================================================
    describe('loginUser', () => {
        const validLoginData = { rut: '12.345.678-5', password: 'secreta123' };
        const mockUser: any = {
            id: 1,
            rut: '12345678-5',
            nombre: 'Juan',
            password: 'hashed-password',
            firebase_uid: 'firebase-uid-123',
            rol: UserRole.USUARIO,
            estado: UserStatus.ACTIVO,
        };

        it('debería autenticar usuario con credenciales correctas', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();
            const firebase = getFirebaseMock();

            userRepo.findByRut.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            firebase.createCustomToken.mockResolvedValue('custom-token-123');
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const result: any = await AuthService.loginUser(validLoginData);

            expect(result.user).toEqual(mockUser);
            expect(result.firebaseToken).toBe('custom-token-123');
        });

        it('debería lanzar error 400 si la validación falla', async () => {
            await expect(
                AuthService.loginUser({ rut: 'invalido', password: '123' }),
            ).rejects.toThrow(AppError);
        });

        it('debería lanzar error 401 si el usuario no existe', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByRut.mockResolvedValue(null);

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 401,
            });
        });

        it('debería lanzar error 401 si no tiene password', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByRut.mockResolvedValue({ ...mockUser, password: null });

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 401,
            });
        });

        it('debería lanzar error 401 si la contraseña no coincide', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();

            userRepo.findByRut.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 401,
            });
        });

        it('debería lanzar error 403 si el usuario está bloqueado', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();

            userRepo.findByRut.mockResolvedValue({ ...mockUser, estado: UserStatus.BLOQUEADO });
            bcrypt.compare.mockResolvedValue(true);

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 403,
            });
        });

        it('debería lanzar error 400 si firebase_uid no existe', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();

            userRepo.findByRut.mockResolvedValue({ ...mockUser, firebase_uid: undefined });
            bcrypt.compare.mockResolvedValue(true);

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it('debería lanzar error 500 si DB falla al buscar RUT', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByRut.mockRejectedValue(new Error('DB error'));
            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 500,
            });
        });

        it('debería lanzar error 500 si setCustomUserClaims falla', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();
            const firebase = getFirebaseMock();

            userRepo.findByRut.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            firebase.setCustomUserClaims.mockRejectedValue(new Error('Firebase error'));

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 500,
            });
        });

        it('debería lanzar error 500 si createCustomToken falla', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();
            const firebase = getFirebaseMock();

            userRepo.findByRut.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            firebase.setCustomUserClaims.mockResolvedValue(undefined);
            firebase.createCustomToken.mockRejectedValue(new Error('Firebase error'));

            await expect(AuthService.loginUser(validLoginData)).rejects.toMatchObject({
                statusCode: 500,
            });
        });
    });

    // ============================================================================
    // registerGuestUser — devuelve { isNew, user, firebaseToken }
    // ============================================================================
    describe('registerGuestUser', () => {
        const guestData = {
            nombre: 'Test',
            rut: '12.345.678-5',
            apellido: 'Test',
            telefono: '912345678',
        };

        it('debería crear usuario invitado exitosamente', async () => {
            const userRepo = getUserRepoMock();
            const firebase = getFirebaseMock();
            const mockGuest = {
                id: 1,
                nombre: 'Test',
                rol: UserRole.INVITADO,
                estado: UserStatus.ACTIVO,
                firebase_uid: 'fb-uid',
            };

            userRepo.findByRut.mockResolvedValue(null);
            userRepo.createGuest.mockResolvedValue(mockGuest);
            firebase.createCustomToken.mockResolvedValue('custom-token');
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const result: any = await AuthService.registerGuestUser(guestData);

            expect(result.isNew).toBe(true);
            expect(result.user).toEqual(mockGuest);
            expect(result.firebaseToken).toBe('custom-token');
        });

        it('debería devolver usuario existente si RUT ya registrado', async () => {
            const userRepo = getUserRepoMock();
            const existing = { id: 1, nombre: 'Existente', firebase_uid: 'existing-uid' };

            userRepo.findByRut.mockResolvedValue(existing);

            const result: any = await AuthService.registerGuestUser(guestData);
            expect(result.isNew).toBe(false);
            expect(result.user).toEqual(existing);
        });

        it('debería vincular firebase_uid si existe pero no vinculado', async () => {
            const userRepo = getUserRepoMock();
            const existing = { id: 1, nombre: 'Existente', firebase_uid: null };
            const updated = { id: 1, nombre: 'Existente', firebase_uid: 'new-fb-uid' };

            userRepo.findByRut.mockResolvedValue(existing);
            userRepo.updateFirebaseUid.mockResolvedValue(updated);

            const result: any = await AuthService.registerGuestUser({
                ...guestData,
                firebase_uid: 'new-fb-uid',
            });
            expect(result.isNew).toBe(false);
            expect(result.user.firebase_uid).toBe('new-fb-uid');
        });

        it('debería lanzar error 500 si DB falla al crear invitado', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByRut.mockResolvedValue(null);
            userRepo.createGuest.mockRejectedValue(new Error('DB error'));

            await expect(AuthService.registerGuestUser(guestData)).rejects.toMatchObject({
                statusCode: 500,
            });
        });
    });

    // ============================================================================
    // upgradeAccount(firebase_uid: string, password: string)
    // ============================================================================
    describe('upgradeAccount', () => {
        it('debería actualizar cuenta invitada con contraseña', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();
            const mockExisting = { id: 1, nombre: 'Invitado', firebase_uid: 'fb-uid' };
            const mockUpdated = { id: 1, nombre: 'Invitado', password: 'hashed-password' };

            userRepo.findByFirebaseUid.mockResolvedValue(mockExisting);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed-password');
            userRepo.update.mockResolvedValue(mockUpdated);

            const result = await AuthService.upgradeAccount('fb-uid', 'secreta123');
            expect(result).toEqual(mockUpdated);
        });

        it('debería rechazar upgrade si usuario no existe', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByFirebaseUid.mockResolvedValue(null);

            await expect(
                AuthService.upgradeAccount('no-existe', 'secreta123'),
            ).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    // ============================================================================
    // registerFullUser(data) — devuelve { user }
    // ============================================================================
    describe('registerFullUser', () => {
        it('debería registrar usuario completo exitosamente', async () => {
            const userRepo = getUserRepoMock();
            const firebase = getFirebaseMock();
            const mockUser = {
                id: 1,
                nombre: 'Juan',
                rut: '12345678-5',
                rol: UserRole.USUARIO,
                estado: UserStatus.ACTIVO,
            };

            firebase.verifyIdToken.mockResolvedValue({ uid: 'firebase-u', email: 'juan@test.cl' });
            userRepo.findByFirebaseUidOrRut.mockResolvedValue(null);
            userRepo.createFullUser.mockResolvedValue(mockUser);
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const result: any = await AuthService.registerFullUser({
                nombre: 'Juan',
                apellido: 'Pérez',
                rut: '12.345.678-5',
                telefono: '912345678',
                password: 'secreta123',
                token: 'valid-firebase-token-12345',
            });

            expect(result.user).toEqual(mockUser);
        });

        it('debería rechazar registro con datos duplicados', async () => {
            const userRepo = getUserRepoMock();
            const firebase = getFirebaseMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'firebase-u', email: 'juan@test.cl' });
            userRepo.findByFirebaseUidOrRut.mockResolvedValue({ id: 2 });

            await expect(
                AuthService.registerFullUser({
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    rut: '12.345.678-5',
                    telefono: '912345678',
                    password: 'secreta123',
                    token: 'valid-firebase-token-12345',
                }),
            ).rejects.toMatchObject({ statusCode: 409 });
        });
    });

    // ============================================================================
    // loginWithGoogle(data) — devuelve { user }
    // ============================================================================
    describe('loginWithGoogle', () => {
        it('debería autenticar con Google exitosamente (nuevo usuario)', async () => {
            const userRepo = getUserRepoMock();
            const firebase = getFirebaseMock();
            const firebaseUid = 'google-uid-123';

            firebase.verifyIdToken.mockResolvedValue({
                uid: firebaseUid,
                email: 'juan@gmail.com',
                name: 'Juan Pérez',
                picture: 'https://example.com/photo.jpg',
            });
            userRepo.findByFirebaseUid.mockResolvedValue(null);
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.createFullUser.mockResolvedValue({
                id: 1,
                firebase_uid: firebaseUid,
                nombre: 'Juan',
                rol: UserRole.USUARIO,
            });
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const result: any = await AuthService.loginWithGoogle({
                token: 'google-auth-token-for-testing',
            });
            expect(result.user).toBeDefined();
        });

        it('debería rechazar token de Google inválido', async () => {
            const firebase = getFirebaseMock();
            firebase.verifyIdToken.mockRejectedValue(new Error('Token inválido'));

            await expect(
                AuthService.loginWithGoogle({ token: 'invalid-but-20char-token!' }),
            ).rejects.toMatchObject({
                statusCode: 401,
            });
        });
    });

    // ============================================================================
    // getUserProfile(userId: number)
    // ============================================================================
    describe('getUserProfile', () => {
        it('debería obtener perfil de usuario existente', async () => {
            const userRepo = getUserRepoMock();
            const mockUser = { id: 1, nombre: 'Juan', email: 'juan@test.cl' };
            userRepo.findById.mockResolvedValue(mockUser);

            const result = await AuthService.getUserProfile(1);
            expect(result).toEqual(mockUser);
        });

        it('debería lanzar 404 si el usuario no existe', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue(null);

            await expect(AuthService.getUserProfile(999)).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    // ============================================================================
    // updateUserProfile(userId, updateData)
    // ============================================================================
    describe('updateUserProfile', () => {
        it('debería actualizar perfil correctamente', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, nombre: 'Viejo' });
            userRepo.update.mockResolvedValue({ id: 1, nombre: 'Nuevo' });

            const result = await AuthService.updateUserProfile(1, { nombre: 'Nuevo' });
            expect(result.nombre).toBe('Nuevo');
        });

        it('debería eliminar campos sensibles', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1 });
            userRepo.update.mockResolvedValue({ id: 1 });

            await AuthService.updateUserProfile(1, {
                rol: UserRole.ADMIN,
                estado: UserStatus.ACTIVO,
                firebase_uid: 'otro-uid',
                nombre: 'Juan',
            } as any);

            const updateCall: any = userRepo.update.mock.calls[0][1];
            expect(updateCall.rol).toBeUndefined();
            expect(updateCall.nombre).toBe('Juan');
        });

        it('debería rechazar RUT duplicado', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1 });
            userRepo.findByRut.mockResolvedValue({ id: 2 });

            await expect(
                AuthService.updateUserProfile(1, { rut: '12.345.678-5' }),
            ).rejects.toMatchObject({ statusCode: 409 });
        });
    });

    // ============================================================================
    // changeUserRole(userId, newRole)
    // ============================================================================
    describe('changeUserRole', () => {
        it('debería cambiar rol y crear perfil brigadista si corresponde', async () => {
            const userRepo = getUserRepoMock();
            const perfilRepo = getPerfilRepoMock();

            userRepo.findById.mockResolvedValue({ id: 1 });
            userRepo.update.mockResolvedValue({ id: 1, rol: UserRole.BRIGADISTA } as any);
            perfilRepo.findByUsuarioId.mockResolvedValue(null);
            perfilRepo.create.mockResolvedValue({ id: 1, usuario_id: 1 });

            const result: any = await AuthService.changeUserRole(1, UserRole.BRIGADISTA);
            expect(result.rol).toBe(UserRole.BRIGADISTA);
            expect(perfilRepo.create).toHaveBeenCalled();
        });
    });

    // ============================================================================
    // syncFcmToken(userId, fcmToken)
    // ============================================================================
    describe('syncFcmToken', () => {
        it('debería sincronizar FCM token correctamente', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1 });
            userRepo.updateFcmToken.mockResolvedValue(undefined);

            await AuthService.syncFcmToken(1, 'fcm-token-123');
            expect(userRepo.updateFcmToken).toHaveBeenCalledWith(1, 'fcm-token-123');
        });
    });

    // ============================================================================
    // getUserStats(userId)
    // ============================================================================
    describe('getUserStats', () => {
        it('debería devolver estadísticas del usuario', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, nombre: 'Juan', email: 'juan@test.cl' });

            const stats = await AuthService.getUserStats(1);
            expect(stats).toBeDefined();
        });
    });

    // ============================================================================
    // getAllUsersForAdmin() — sin argumentos
    // ============================================================================
    describe('getAllUsersForAdmin', () => {
        it('debería devolver todos los usuarios', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const users = await AuthService.getAllUsersForAdmin();
            expect(users).toHaveLength(2);
        });
    });

    // ============================================================================
    // terminateUser(userId)
    // ============================================================================
    describe('terminateUser', () => {
        it('debería eliminar usuario existente', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, firebase_uid: 'firebase-uid' });
            userRepo.delete.mockResolvedValue(undefined);

            await AuthService.terminateUser(1);
            expect(userRepo.delete).toHaveBeenCalledWith(1);
        });
    });

    // ============================================================================
    // convertGuestToCitizen(firebase_uid: string, password: string)
    // ============================================================================
    describe('convertGuestToCitizen', () => {
        it('debería lanzar error para usuario no invitado', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByFirebaseUid.mockResolvedValue({ id: 1, rol: UserRole.USUARIO });

            await expect(
                AuthService.convertGuestToCitizen('fb-uid', 'secreta123'),
            ).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it('debería convertir invitado a ciudadano exitosamente', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();

            userRepo.findByFirebaseUid.mockResolvedValue({ id: 1, rol: UserRole.INVITADO });
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed-password');
            userRepo.update.mockResolvedValue({ id: 1, rol: UserRole.USUARIO } as any);

            const result = await AuthService.convertGuestToCitizen('fb-uid', 'secreta123');
            expect(result.rol).toBe(UserRole.USUARIO);
        });
    });

    // ============================================================================
    // getPerfilBrigadista(userId) — devuelve UsuarioWithPerfil
    // (el servicio NO valida rol — la validación está en el middleware de rutas)
    // ============================================================================
    describe('getPerfilBrigadista', () => {
        it('debería obtener perfil (incluyendo null si no existe)', async () => {
            const userRepo = getUserRepoMock();
            const perfilRepo = getPerfilRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, rol: UserRole.USUARIO });
            perfilRepo.findByUsuarioId.mockResolvedValue(null);

            const result: any = await AuthService.getPerfilBrigadista(1);
            expect(result.perfil_brigadista).toBeNull();
        });
    });

    // ============================================================================
    // updatePerfilBrigadista(userId, updateData)
    // (el servicio NO valida rol — la validación está en el middleware de rutas)
    // ============================================================================
    describe('updatePerfilBrigadista', () => {
        it('debería lanzar error si no se proporcionan campos válidos', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, rol: UserRole.USUARIO });

            await expect(AuthService.updatePerfilBrigadista(1, {} as any)).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it('debería actualizar perfil correctamente', async () => {
            const userRepo = getUserRepoMock();
            const perfilRepo = getPerfilRepoMock();
            userRepo.findById.mockResolvedValue({ id: 1, nombre: 'Juan' });
            perfilRepo.findByUsuarioId = jest.fn();
            perfilRepo.update.mockResolvedValue({ id: 1, organismo: 'Bomberos' } as any);

            const result: any = await AuthService.updatePerfilBrigadista(1, {
                organismo: 'Bomberos',
            });
            expect(result.perfil_brigadista.organismo).toBe('Bomberos');
        });
    });

    // ============================================================================
    // adminCreateBrigadista(userId, perfilData)
    // ============================================================================
    describe('adminCreateBrigadista', () => {
        it('debería crear brigadista exitosamente', async () => {
            const userRepo = getUserRepoMock();
            const perfilRepo = getPerfilRepoMock();

            userRepo.findById.mockResolvedValue({
                id: 1,
                nombre: 'Brigadista',
                rol: UserRole.USUARIO,
            });
            perfilRepo.findByUsuarioId.mockResolvedValue(null);
            perfilRepo.create.mockResolvedValue({ id: 1, usuario_id: 1 });

            const result: any = await AuthService.adminCreateBrigadista(1, {
                organismo: 'Bomberos',
                rango: 'Capitán',
            });

            expect(result.perfil_brigadista).toBeDefined();
            expect(result.rol).toBe(UserRole.BRIGADISTA);
        });

        it('debería rechazar si ya tiene perfil', async () => {
            const perfilRepo = getPerfilRepoMock();
            const userRepo = getUserRepoMock();

            userRepo.findById.mockResolvedValue({ id: 1, nombre: 'Brigadista' });
            perfilRepo.findByUsuarioId.mockResolvedValue({ id: 1 } as any);

            await expect(AuthService.adminCreateBrigadista(1, {} as any)).rejects.toMatchObject({
                statusCode: 409,
            });
        });
    });
});
