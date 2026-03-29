import * as admin from 'firebase-admin';
import { envs } from './envs';

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: envs.FIREBASE_PROJECT_ID,
            clientEmail: envs.FIREBASE_CLIENT_EMAIL,
            privateKey: envs.FIREBASE_PRIVATE_KEY,
        }),
    });

    console.log('🔥 Conectado exitosamente a Firebase Admin (ms-alertas)');
} catch (error: any) {
    if (!/already exists/u.test(error.message)) {
        console.error('❌ Error inicializando Firebase Admin en ms-alertas:', error.message);
    }
}

export default admin;
