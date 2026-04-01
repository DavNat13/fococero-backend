import * as admin from 'firebase-admin';
import { envs } from './envs';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: envs.FIREBASE_PROJECT_ID,
                clientEmail: envs.FIREBASE_CLIENT_EMAIL,
                privateKey: envs.FIREBASE_PRIVATE_KEY,
            }),
        });
        console.log('🔥 Firebase Admin SDK inicializado correctamente para ms-reportes.');
    } catch (error) {
        console.error('❌ Error fatal al inicializar Firebase Admin SDK:', error);
        process.exit(1);
    }
}

export default admin;