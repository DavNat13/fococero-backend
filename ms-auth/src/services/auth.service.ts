// ms-auth/src/services/auth.service.ts

import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { PerfilBrigadistaRepository } from '../repositories/perfil-brigadista.repository';
import { AuthValidator, GuestRegisterDTO, FullRegisterDTO } from '../validators/auth.validator';
import admin from '../config/firebase';
import { RutHelper } from '../helpers/rut.helper';
import { Usuario } from '../models/user.model';
import { UserRole, UserStatus } from '../models/user.enum';
import { AppError } from '../helpers/appError';

/**
 * AuthService: Núcleo de lógica del Proveedor de Identidad.
 * Coordina la validación de tokens de Google con la persistencia en PostgreSQL.
 */
export class AuthService {
    // ============================================================================
    // 🟢 SECCIÓN: REGISTRO Y AUTENTICACIÓN
    // ============================================================================

    /**
     * Registra un usuario invitado (RUT y datos básicos).
     * Si el RUT ya existe, retorna el usuario actual sin crear duplicados.
     */
    static async registerGuestUser(data: GuestRegisterDTO) {
        const validation = AuthValidator.validateGuest(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Datos de invitado inválidos', 400);
        }

        const rutFormateado = RutHelper.format(data.rut);
        const existingUser = await UserRepository.findByRut(rutFormateado);

        if (existingUser) {
            if (data.firebase_uid && !existingUser.firebase_uid) {
                const updated = await UserRepository.updateFirebaseUid(
                    existingUser.id!,
                    data.firebase_uid,
                    existingUser.fcm_token || '',
                );
                return { isNew: false, user: updated };
            }
            return { isNew: false, user: existingUser };
        }

        let newUser;
        try {
            newUser = await UserRepository.createGuest({
                rut: rutFormateado,
                nombre: data.nombre.trim(),
                apellido: data.apellido.trim(),
                telefono: data.telefono.trim(),
                rol: UserRole.USUARIO,
                estado: UserStatus.ACTIVO,
            });
        } catch {
            throw new AppError('Error al crear el usuario en la base de datos.', 500);
        }

        const firebaseToken = await admin.auth().createCustomToken(String(newUser.id));
        await admin.auth().setCustomUserClaims(String(newUser.id), { rol: UserRole.USUARIO });

        return { isNew: true, user: newUser, firebaseToken };
    }

    /**
     * Vincula una cuenta de Google (Firebase) con un perfil de usuario real.
     */
    static async registerFullUser(data: FullRegisterDTO) {
        const validation = AuthValidator.validateFullRegister(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Datos de registro completos inválidos', 400);
        }

        const rutFormateado = RutHelper.format(data.rut);

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(data.token);
        } catch (_error) {
            throw new AppError('La sesión de Google ha expirado o es inválida.', 401);
        }

        const { uid: firebaseUid, email } = decodedToken;

        const existingUser = await UserRepository.findByFirebaseUidOrRut(
            firebaseUid,
            rutFormateado,
        );

        if (existingUser) {
            throw new AppError(
                'Esta cuenta de Google o RUT ya se encuentran registrados en FocoCero.',
                409,
            );
        }

        const user = await UserRepository.createFullUser({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            email: email,
            firebase_uid: firebaseUid,
            rol: UserRole.USUARIO,
            estado: UserStatus.ACTIVO,
        });

        return { user };
    }

    // ============================================================================
    // 🔵 SECCIÓN: LOGIN Y AUTENTICACIÓN POR CREDENCIALES
    // ============================================================================

    static async loginUser(data: { rut: string; password: string }) {
        const validation = AuthValidator.validateLogin(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Credenciales inválidas', 400);
        }

        const rutFormateado = RutHelper.format(data.rut);

        let user: Usuario | null;
        try {
            user = await UserRepository.findByRut(rutFormateado);
        } catch (_error) {
            throw new AppError('Error interno al buscar usuario.', 500);
        }

        if (!user) {
            throw new AppError('Credenciales inválidas.', 401);
        }

        if (!user.password) {
            throw new AppError('Esta cuenta no tiene contraseña configurada. Inicia con Google.', 401);
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (!passwordMatch) {
            throw new AppError('Credenciales inválidas.', 401);
        }

        if (user.estado !== UserStatus.ACTIVO) {
            throw new AppError('Cuenta bloqueada. Contacta al administrador.', 403);
        }

        if (!user.firebase_uid) {
            throw new AppError('Cuenta no vinculada a Firebase. Contacta al administrador.', 400);
        }

        try {
            await admin.auth().setCustomUserClaims(user.firebase_uid, { rol: user.rol });
            const firebaseToken = await admin.auth().createCustomToken(user.firebase_uid);
            return { user, firebaseToken };
        } catch (_error) {
            throw new AppError('Error al generar token de autenticación.', 500);
        }
    }

    static async loginWithGoogle(data: { token: string }) {
        const validation = AuthValidator.validateGoogleAuth(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Token de Google inválido.', 400);
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(data.token);
        } catch (_error) {
            throw new AppError('La sesión de Google ha expirado o es inválida.', 401);
        }

        const { uid: firebaseUid, email, name } = decodedToken;

        let user = await UserRepository.findByFirebaseUid(firebaseUid);

        if (user) {
            return { user };
        }

        user = await UserRepository.findByEmail(email || '');

        if (user) {
            const updated = await UserRepository.update(user.id!, {
                firebase_uid: firebaseUid,
                email: email || user.email,
            });
            return { user: updated };
        }

        const nameParts = (name || 'Usuario Google').split(' ');
        const newUser = await UserRepository.createFullUser({
            rut: 'GG' + firebaseUid.slice(-8),
            nombre: nameParts[0] || 'Usuario',
            apellido: nameParts.slice(1).join(' ') || 'Google',
            email: email || '',
            telefono: '',
            firebase_uid: firebaseUid,
            rol: UserRole.USUARIO,
            estado: UserStatus.ACTIVO,
        });

        await admin.auth().setCustomUserClaims(firebaseUid, { rol: UserRole.USUARIO });

        return { user: newUser };
    }

    static async upgradeAccount(firebaseUid: string, password: string) {
        const user = await UserRepository.findByFirebaseUid(firebaseUid);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        if (!password || password.length < 6) {
            throw new AppError('La contraseña debe tener al menos 6 caracteres.', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updated = await UserRepository.update(user.id!, {
            password: hashedPassword,
        });

        return updated;
    }

    static async convertGuestToCitizen(firebaseUid: string, password: string) {
        const user = await UserRepository.findByFirebaseUid(firebaseUid);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        if (user.rol !== UserRole.INVITADO) {
            throw new AppError('El usuario no es un invitado.', 400);
        }

        if (!password || password.length < 6) {
            throw new AppError('La contraseña debe tener al menos 6 caracteres.', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updated = await UserRepository.update(user.id!, {
            rol: UserRole.USUARIO,
            password: hashedPassword,
        });

        if (!updated) {
            throw new AppError('Error al actualizar el usuario.', 500);
        }
        return updated;
    }

    // ============================================================================
    // 🔵 SECCIÓN: CONSULTAS Y PERFILES
    // ============================================================================

    static async getUserProfile(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('No se encontró el perfil del usuario.', 404);
        }
        return user;
    }

    static async getAllUsersForAdmin() {
        return await UserRepository.findAll();
    }

    static async getUserStats(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        return { totalReportes: 0, alertasActivas: 0 };
    }

    static async getPerfilBrigadista(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        const perfil = await PerfilBrigadistaRepository.findByUsuarioId(userId);
        return { ...user, perfil_brigadista: perfil || null };
    }

    // ============================================================================
    // 🟡 SECCIÓN: ACTUALIZACIONES Y ESTADOS
    // ============================================================================

    static async updateUserProfile(userId: number, updateData: Partial<Usuario>) {
        delete updateData.rol;
        delete updateData.estado;
        delete updateData.firebase_uid;

        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario inexistente.', 404);
        }

        if (updateData.rut) {
            updateData.rut = RutHelper.format(updateData.rut);
            const duplicate = await UserRepository.findByRut(updateData.rut);
            if (duplicate && duplicate.id !== userId) {
                throw new AppError('El RUT ingresado ya está vinculado a otra cuenta.', 409);
            }
        }

        if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
        if (updateData.apellido) updateData.apellido = updateData.apellido.trim();

        const updated = await UserRepository.update(userId, updateData);
        if (!updated) {
            throw new AppError('Error al actualizar el perfil en la base de datos.', 500);
        }

        return updated;
    }

    static async changeUserRole(userId: number, newRole: UserRole) {
        if (!Object.values(UserRole).includes(newRole)) {
            throw new AppError('El rol especificado no existe en el sistema.', 400);
        }

        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        const updated = await UserRepository.update(userId, { rol: newRole });

        if (newRole === UserRole.BRIGADISTA) {
            const existingPerfil = await PerfilBrigadistaRepository.findByUsuarioId(userId);
            if (!existingPerfil) {
                await PerfilBrigadistaRepository.create({ usuario_id: userId });
            }
        }

        return updated;
    }

    static async updateUserStatus(userId: number, newStatus: UserStatus) {
        if (!Object.values(UserStatus).includes(newStatus)) {
            throw new AppError('El estado especificado es inválido.', 400);
        }
        return await UserRepository.update(userId, { estado: newStatus });
    }

    static async syncFcmToken(userId: number, fcmToken: string) {
        if (!fcmToken || fcmToken.trim().length < 10) {
            throw new AppError('El token FCM proporcionado es inválido.', 400);
        }
        await UserRepository.updateFcmToken(userId, fcmToken);
    }

    static async updatePerfilBrigadista(userId: number, data: {
        organismo?: string;
        rango?: string;
        zona_asignada?: string;
        numero_placa?: string;
        fecha_ingreso?: string;
    }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        const perfilExists = await PerfilBrigadistaRepository.findByUsuarioId(userId);
        if (!perfilExists) {
            await PerfilBrigadistaRepository.create({ usuario_id: userId, ...data });
        }

        const updated = await PerfilBrigadistaRepository.update(userId, data);
        if (!updated) {
            throw new AppError('No se proporcionaron campos válidos para actualizar.', 400);
        }

        return { ...user, perfil_brigadista: updated };
    }

    static async adminCreateBrigadista(userId: number, data: {
        organismo?: string;
        rango?: string;
        zona_asignada?: string;
        numero_placa?: string;
        fecha_ingreso?: string;
    }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        const existingPerfil = await PerfilBrigadistaRepository.findByUsuarioId(userId);
        if (existingPerfil) {
            throw new AppError('El usuario ya tiene un perfil de brigadista.', 409);
        }

        const perfil = await PerfilBrigadistaRepository.create({
            usuario_id: userId,
            organismo: data.organismo || '',
            rango: data.rango || '',
            zona_asignada: data.zona_asignada || '',
            numero_placa: data.numero_placa || '',
            fecha_ingreso: data.fecha_ingreso || undefined,
        });

        const updatedUser = await UserRepository.update(userId, { rol: UserRole.BRIGADISTA });

        return { ...updatedUser, perfil_brigadista: perfil, rol: UserRole.BRIGADISTA };
    }

    // ============================================================================
    // 🔴 SECCIÓN: ELIMINACIÓN
    // ============================================================================

    static async terminateUser(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Operación fallida: Usuario no encontrado.', 404);
        }

        return await UserRepository.delete(userId);
    }
}
