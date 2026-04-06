import { UserRepository } from '../repositories/user.repository';
import { AuthValidator } from '../validators/auth.validator';
import admin from '../config/firebase';
import { RutHelper } from '../helpers/rut.helper';
import { Usuario } from '../models/user.model';
import { UserRole, UserStatus } from '../models/user.enum';

/**
 * AuthService: Motor de lógica de negocio para la identidad en FocoCero.
 */
export class AuthService {
    // --- 🟢 SECCIÓN: REGISTRO Y LOGIN (CREATE / SYNC) ---

    static async registerGuestUser(data: any) {
        const validation = AuthValidator.validateGuest(data);
        if (!validation.isValid) throw new Error(validation.error);

        const rutFormateado = RutHelper.format(data.rut);
        const existingUser = await UserRepository.findByRut(rutFormateado);
        if (existingUser) return { isNew: false, user: existingUser };

        const newUser = await UserRepository.createGuest({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            rol: UserRole.INVITADO,
            estado: UserStatus.ACTIVO,
        });

        return { isNew: true, user: newUser };
    }

    /**
     * Registro completo vinculado a cuenta de Google/Firebase.
     * Soporta 'fococero_test_token' para pruebas locales.
     */
    static async registerFullUser(data: any) {
        const validation = AuthValidator.validateFullRegister(data);
        if (!validation.isValid) throw new Error(validation.error);

        const rutFormateado = RutHelper.format(data.rut);

        let decodedToken;

        // 🟢 BYPASS PARA SWAGGER (MODO TEST)
        if (data.token === 'fococero_test_token' && process.env.NODE_ENV !== 'production') {
            decodedToken = {
                uid: `test-uid-${Date.now()}`,
                email: 'swagger-full-test@fococero.cl',
            };
        } else {
            // 🔴 LÓGICA REAL: Verificación criptográfica con Firebase
            try {
                decodedToken = await admin.auth().verifyIdToken(data.token);
            } catch (error) {
                throw new Error('Sesión de Firebase inválida o expirada.');
            }
        }

        const { uid: firebaseUid, email } = decodedToken;

        const existingUser = await UserRepository.findByFirebaseUidOrRut(
            firebaseUid,
            rutFormateado,
        );
        if (existingUser) throw new Error('Esta identidad o cuenta de Google ya está registrada.');

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

    // --- 🔵 SECCIÓN: CONSULTAS (READ) ---

    static async getUserProfile(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('Usuario no encontrado en la base de datos.');
        return user;
    }

    static async getAllUsersForAdmin() {
        return await UserRepository.findAll();
    }

    // --- 🟡 SECCIÓN: ACTUALIZACIONES (UPDATE) ---

    static async updateUserProfile(userId: number, updateData: Partial<Usuario>) {
        delete updateData.rol;
        delete updateData.estado;
        delete updateData.firebase_uid;

        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('El usuario solicitado no existe.');

        if (updateData.rut) {
            updateData.rut = RutHelper.format(updateData.rut);
            const duplicate = await UserRepository.findByRut(updateData.rut);
            if (duplicate && duplicate.id !== userId)
                throw new Error('El RUT ingresado ya está en uso.');
        }

        if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
        if (updateData.apellido) updateData.apellido = updateData.apellido.trim();

        return await UserRepository.update(userId, updateData);
    }

    static async changeUserRole(userId: number, newRole: UserRole) {
        if (!Object.values(UserRole).includes(newRole)) {
            throw new Error('El rol proporcionado no es válido para el ecosistema FocoCero.');
        }
        return await UserRepository.update(userId, { rol: newRole });
    }

    static async updateUserStatus(userId: number, newStatus: UserStatus) {
        if (!Object.values(UserStatus).includes(newStatus)) {
            throw new Error('Estado de usuario no reconocido por el sistema.');
        }
        return await UserRepository.update(userId, { estado: newStatus });
    }

    static async syncFcmToken(userId: number, fcmToken: string) {
        if (!fcmToken) throw new Error('Token de notificación inválido.');
        await UserRepository.updateFcmToken(userId, fcmToken);
    }

    // --- 🔴 SECCIÓN: ELIMINACIÓN (DELETE) ---

    static async terminateUser(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('Imposible eliminar: Usuario no encontrado.');
        return await UserRepository.delete(userId);
    }
}
