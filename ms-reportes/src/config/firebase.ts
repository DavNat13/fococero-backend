// ms-reportes/src/config/firebase.ts
import * as admin from 'firebase-admin';
import { envs } from './envs';
import { logger } from './logger';

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
        logger.info('🔥 Firebase Admin SDK inicializado correctamente para ms-reportes.');
        return app;
    } catch (error: unknown) {
        // ✅ FIX: Imprimimos el error real de forma segura para depurar
        if (error instanceof Error) {
            logger.error({ err: error }, '❌ Error fatal al inicializar Firebase Admin SDK');
        } else {
            logger.error('❌ Error desconocido en Firebase: ' + String(error));
        }
        process.exit(1);
    }
};

initializeFirebase();

export default admin;
