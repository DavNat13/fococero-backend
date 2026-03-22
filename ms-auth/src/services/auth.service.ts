import { UserRepository } from '../repositories/user.repository';
import { AuthValidator } from '../validators/auth.validator';
import admin from '../config/firebase';
import { RutHelper } from '../helpers/rut.helper';
import { Usuario } from '../models/user.model';
import { UserRole, UserStatus } from '../models/user.enum'; 

/**
 * AuthService: Motor de lógica de negocio para la identidad en FocoCero.
 * Se encarga de la orquestación entre Firebase, validaciones de RUT y persistencia en PostgreSQL.
 */
export class AuthService {
    
    // --- 🟢 SECCIÓN: REGISTRO Y LOGIN (CREATE / SYNC) ---

    /**
     * Registro rápido para ciudadanos en situación de emergencia (Invitados).
     * Optimizado: Si el RUT ya existe, recupera el perfil para evitar duplicidad.
     */
    static async registerGuestUser(data: any) {
        // 1. Validación de estructura de entrada
        const validation = AuthValidator.validateGuest(data);
        if (!validation.isValid) throw new Error(validation.error);

        // 2. Estandarización de RUT (Lógica de Chile: puntos y guion)
        const rutFormateado = RutHelper.format(data.rut);

        // 3. Verificación de existencia previa para evitar colisiones
        const existingUser = await UserRepository.findByRut(rutFormateado);
        if (existingUser) return { isNew: false, user: existingUser };

        // 4. Creación bajo demanda con roles estandarizados
        const newUser = await UserRepository.createGuest({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            rol: UserRole.INVITADO,    
            estado: UserStatus.ACTIVO  
        });

        return { isNew: true, user: newUser };
    }

    /**
     * Registro completo vinculado a cuenta de Google/Firebase.
     * Seguridad: Valida el JWT de Google antes de proceder con la creación.
     */
    static async registerFullUser(data: any) {
        const validation = AuthValidator.validateFullRegister(data);
        if (!validation.isValid) throw new Error(validation.error);

        const rutFormateado = RutHelper.format(data.rut);

        // Verificación criptográfica del token de Firebase
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(data.token);
        } catch (error) {
            throw new Error('Sesión de Firebase inválida o expirada.');
        }

        const { uid: firebaseUid, email } = decodedToken;

        // Validación de identidad única (Un ciudadano = Una cuenta)
        const existingUser = await UserRepository.findByFirebaseUidOrRut(firebaseUid, rutFormateado);
        if (existingUser) throw new Error('Esta identidad o cuenta de Google ya está registrada.');

        return await UserRepository.createFullUser({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            email: email, 
            firebase_uid: firebaseUid,
            rol: UserRole.USUARIO,     
            estado: UserStatus.ACTIVO 
        });
    }

    // --- 🔵 SECCIÓN: CONSULTAS (READ) ---

    /**
     * Recupera el perfil detallado de un usuario.
     * Utilizado para hidratar el estado global de la aplicación al iniciar sesión.
     */
    static async getUserProfile(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('Usuario no encontrado en la base de datos.');
        return user;
    }

    /**
     * Obtiene el listado maestro de usuarios.
     * Acceso Restringido: Solo para paneles de control administrativo.
     */
    static async getAllUsersForAdmin() {
        return await UserRepository.findAll();
    }

    // --- 🟡 SECCIÓN: ACTUALIZACIONES (UPDATE) ---

    /**
     * Actualización de perfil por el propio usuario.
     * Seguridad: Filtra campos sensibles para evitar escalada de privilegios.
     */
    static async updateUserProfile(userId: number, updateData: Partial<Usuario>) {
        // 🔒 PROTECCIÓN: Un usuario no puede "ascenderse" a Admin ni "activarse" si está baneado
        delete updateData.rol;
        delete updateData.estado;
        delete updateData.firebase_uid;

        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('El usuario solicitado no existe.');

        // Si hay cambio de RUT, validamos que el nuevo no esté tomado
        if (updateData.rut) {
            updateData.rut = RutHelper.format(updateData.rut);
            const duplicate = await UserRepository.findByRut(updateData.rut);
            if (duplicate && duplicate.id !== userId) throw new Error('El RUT ingresado ya está en uso.');
        }

        // Limpieza de strings para consistencia en la BD
        if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
        if (updateData.apellido) updateData.apellido = updateData.apellido.trim();

        return await UserRepository.update(userId, updateData);
    }

    /**
     * Gestión de Roles (Acción Administrativa).
     * Permite elevar usuarios a Brigadistas o Administradores de forma segura.
     */
    static async changeUserRole(userId: number, newRole: UserRole) {
        if (!Object.values(UserRole).includes(newRole)) {
            throw new Error('El rol proporcionado no es válido para el ecosistema FocoCero.');
        }
        return await UserRepository.update(userId, { rol: newRole });
    }

    /**
     * Gestión de Estados (Acción Administrativa).
     * Permite bloquear (BAN) usuarios o suspender cuentas por mal uso del sistema.
     */
    static async updateUserStatus(userId: number, newStatus: UserStatus) {
        if (!Object.values(UserStatus).includes(newStatus)) {
            throw new Error('Estado de usuario no reconocido por el sistema.');
        }
        return await UserRepository.update(userId, { estado: newStatus });
    }

    /**
     * Sincronización de token de notificaciones Push (FCM).
     * Vital para que las alertas de incendio lleguen al dispositivo correcto en tiempo real.
     */
    static async syncFcmToken(userId: number, fcmToken: string) {
        if (!fcmToken) throw new Error('Token de notificación inválido.');
        await UserRepository.updateFcmToken(userId, fcmToken);
    }

    // --- 🔴 SECCIÓN: ELIMINACIÓN (DELETE) ---

    /**
     * Eliminación definitiva de usuario.
     * Nota: En producción se recomienda Soft Delete, pero aquí aplicamos remoción total.
     */
    static async terminateUser(userId: number) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('Imposible eliminar: Usuario no encontrado.');
        
        return await UserRepository.delete(userId);
    }
}