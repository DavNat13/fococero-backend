// ms-alertas/src/config/firebase.ts
import * as admin from 'firebase-admin';
import { envs } from './envs';

/**
 * Inicialización de Firebase con Patrón Singleton.
 * Se elimina el uso de 'any' mediante un Type Guard (instanceof Error)
 * garantizando la seguridad de tipos en tiempo de compilación.
 */
const initializeFirebase = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: envs.FIREBASE_PROJECT_ID,
                clientEmail: envs.FIREBASE_CLIENT_EMAIL,
                privateKey: envs.FIREBASE_PRIVATE_KEY,
            }),
        });
        console.log('🔥 [Firebase] SDK inicializado exitosamente.');
        return app;
    } catch (error: unknown) {
        // Tipado estricto: asume que el origen del fallo es desconocido
        if (error instanceof Error) {
            // TypeScript ahora sabe con 100% de certeza que 'error' tiene una propiedad 'message'
            console.error('❌ [Firebase] Error crítico de inicialización:', error.message);
        } else {
            // Fallback para objetos arrojados que no heredan de la clase Error estándar
            console.error(
                '❌ [Firebase] Error crítico de inicialización (Tipo no estándar):',
                error,
            );
        }

        process.exit(1);
    }
};

initializeFirebase();

export default admin;
