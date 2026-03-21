import { UserRepository } from '../repositories/user.repository';
import { AuthValidator } from '../validators/auth.validator';
import admin from '../config/firebase';
import { RutHelper } from '../helpers/rut.helper';

export class AuthService {
    
    /**
     * Registro rápido para ciudadanos en emergencia (Invitados)
     */
    static async registerGuestUser(data: any) {
        // 1. Validaciones de formato
        const validation = AuthValidator.validateGuest(data);
        if (!validation.isValid) throw new Error(validation.error);

        // 2. Estandarización de RUT (Enterprise: evita duplicados por puntos o guiones)
        const rutFormateado = RutHelper.format(data.rut);

        // 3. Verificación de existencia previa
        const existingUser = await UserRepository.findByRut(rutFormateado);
        if (existingUser) return { isNew: false, user: existingUser };

        // 4. Creación en PostgreSQL
        const newUser = await UserRepository.createGuest({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim()
        });

        return { isNew: true, user: newUser };
    }

    /**
     * Registro completo vinculado a cuenta de Firebase (Google/Email)
     */
    static async registerFullUser(data: any) {
        // 1. Validaciones de entrada
        const validation = AuthValidator.validateFullRegister(data);
        if (!validation.isValid) throw new Error(validation.error);

        const rutFormateado = RutHelper.format(data.rut);

        // 2. Verificación de seguridad con Google Firebase
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(data.token);
        } catch (error) {
            throw new Error('Token de Firebase inválido o expirado. Autenticación fallida.');
        }

        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;

        // 3. Verificación de integridad (RUT o UID ya registrados)
        const existingUser = await UserRepository.findByFirebaseUidOrRut(firebaseUid, rutFormateado);
        if (existingUser) throw new Error('El usuario ya se encuentra registrado con este RUT o cuenta de Google.');

        // 4. Persistencia en base de datos
        const newUser = await UserRepository.createFullUser({
            rut: rutFormateado,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono.trim(),
            email: email, 
            firebase_uid: firebaseUid 
        });

        return newUser;
    }

    /**
     * Lógica Post-Login: Sincronización de perfil y tokens de notificación
     * @param user Usuario recuperado por el middleware de autenticación
     * @param fcmToken Token del dispositivo enviado por el frontend para Push Notifications
     */
    static async loginUser(user: any, fcmToken?: string) {
        // Si el frontend envía un token de dispositivo nuevo o diferente, lo actualizamos.
        // Esto permite que FocoCero envíe alertas de incendio al celular correcto.
        if (fcmToken && user.fcm_token !== fcmToken) {
            await UserRepository.updateFcmToken(user.id, fcmToken);
            user.fcm_token = fcmToken; // Actualizamos el objeto en memoria para la respuesta
        }

        return user;
    }
}