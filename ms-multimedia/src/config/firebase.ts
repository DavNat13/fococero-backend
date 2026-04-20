// ms-multimedia/src/config/firebase.ts

import * as admin from 'firebase-admin';
import { envs } from './envs';

// Patrón Singleton: Evita inicializar Firebase múltiples veces si ocurre un hot-reload en desarrollo
if (!admin.apps.length) {
    // Al leer desde el .env, el salto de línea literal "\\n" debe convertirse a un salto real "\n"
    const privateKey = envs.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: envs.FIREBASE_PROJECT_ID,
            clientEmail: envs.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
        storageBucket: envs.FIREBASE_STORAGE_BUCKET,
    });
}

// Exportamos el bucket listo para recibir los buffers de Sharp
export const bucket = admin.storage().bucket();
