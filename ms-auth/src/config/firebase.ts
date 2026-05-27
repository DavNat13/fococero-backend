// ms-auth/src/config/firebase.ts
import * as admin from 'firebase-admin';
import { envs } from './envs';
import { logger } from './logger';

/**
 * Inicialización de Firebase con Patrón Singleton y Type Guard.
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
        logger.info('🔥 [Firebase] Admin SDK inicializado exitosamente (ms-auth)');
        return app;
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error({ err: error }, '❌ [Firebase] Error inicializando Admin SDK');
        } else {
            logger.error('❌ [Firebase] Error inicializando Admin SDK (Tipo Desconocido): ' + String(error));
        }

        // En ms-auth, si Firebase falla, el servicio entero es inútil. Fallo determinista.
        process.exit(1);
    }
};

initializeFirebase();

export default admin;
