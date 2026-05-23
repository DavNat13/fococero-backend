// ms-auth/src/services/auth.service.ts

import { UserRepository } from '../repositories/user.repository';
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
        // Validación de contrato de entrada
        const validation = AuthValidator.validateGuest(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Datos de invitado inválidos', 400);
        }

        const rutFormateado = RutHelper.format(data.rut);
        const existingUser = await UserRepository.findByRut(rutFormateado);

        if (existingUser) {
            return { isNew: false, user: existingUser };
        }

        const newUser = await UserRepository.createGuest({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            rol: UserRole.USUARIO,
            estado: UserStatus.ACTIVO,
        });

        return { isNew: true, user: newUser };
    }

    /**
     * Vincula una cuenta de Google (Firebase) con un perfil de usuario real.
     * Valida la firma criptográfica del token antes de proceder.
     */
    static async registerFullUser(data: FullRegisterDTO) {
        const validation = AuthValidator.validateFullRegister(data);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Datos de registro completos inválidos', 400);
        }

        const rutFormateado = RutHelper.format(data.rut);

        // Validación criptográfica con Firebase
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(data.token);
        } catch (_error) {
            // ✅ FIX: Prefijo '_' para cumplir con ESLint (error no utilizado)
            throw new AppError('La sesión de Google ha expirado o es inválida.', 401);
        }

        const { uid: firebaseUid, email } = decodedToken;

        // Evitar colisiones de identidad (RUT o UID ya registrados)
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

        return await UserRepository.createFullUser({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            email: email,
            firebase_uid: firebaseUid,
            rol: UserRole.USUARIO,
            estado: UserStatus.ACTIVO,
        });
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

    // ============================================================================
    // 🟡 SECCIÓN: ACTUALIZACIONES Y ESTADOS
    // ============================================================================

    /**
     * Actualiza el perfil permitiendo solo cambios en campos no sensibles.
     */
    static async updateUserProfile(userId: number, updateData: Partial<Usuario>) {
        // Bloqueo de seguridad: No se puede cambiar rol o estado por esta vía
        delete updateData.rol;
        delete updateData.estado;
        delete updateData.firebase_uid;

        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario inexistente.', 404);
        }

        // Si cambia el RUT, verificar que no pertenezca a otro usuario
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
        return await UserRepository.update(userId, { rol: newRole });
    }

    static async updateUserStatus(userId: number, newStatus: UserStatus) {
        if (!Object.values(UserStatus).includes(newStatus)) {
            throw new AppError('El estado especificado es inválido.', 400);
        }
        return await UserRepository.update(userId, { estado: newStatus });
    }

    /**
     * Sincroniza el token de Firebase Cloud Messaging para notificaciones push.
     */
    static async syncFcmToken(userId: number, fcmToken: string) {
        if (!fcmToken || fcmToken.trim().length < 10) {
            throw new AppError('El token FCM proporcionado es inválido.', 400);
        }
        await UserRepository.updateFcmToken(userId, fcmToken);
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
