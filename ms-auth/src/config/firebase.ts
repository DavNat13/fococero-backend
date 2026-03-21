import * as admin from 'firebase-admin';
import { envs } from './envs';

try {
    // Inicializamos la aplicación de Firebase con las credenciales del sistema
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: envs.FIREBASE_PROJECT_ID,
            clientEmail: envs.FIREBASE_CLIENT_EMAIL,
            privateKey: envs.FIREBASE_PRIVATE_KEY,
        }),
    });

    console.log('🔥 Conectado exitosamente a Firebase Admin');
} catch (error: any) {
    // Si falla (por ejemplo, credenciales inválidas o vacías), no detenemos el servidor de Auth,
    // pero dejamos un log claro para el desarrollador.
    if (!/already exists/u.test(error.message)) {
        console.error('❌ Error inicializando Firebase Admin:', error.message);
    }
}

// Exportamos la instancia para usarla luego en notificaciones o validación de tokens
export default admin;