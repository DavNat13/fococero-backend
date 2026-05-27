// ms-geo/src/config/firebase.ts
import * as admin from 'firebase-admin';
import { envs } from './envs';
import { logger } from './logger';

try {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: envs.FIREBASE_PROJECT_ID,
                clientEmail: envs.FIREBASE_CLIENT_EMAIL,
                privateKey: envs.FIREBASE_PRIVATE_KEY,
            }),
        });
        logger.info('🔥 Firebase Admin SDK vinculado a ms-geo');
    }
} catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('🚨 FATAL ERROR: ms-geo no pudo inicializar Firebase Admin: ' + msg);
    process.exit(1);
}

export default admin;
