// src/config/firebase.ts

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

    console.log('🔥 Conectado exitosamente a Firebase Admin (ms-geo)');
} catch (error: any) {
    // Escudo 4: Ignorar el error si Firebase ya estaba inicializado (común al usar nodemon/ts-node-dev)
    if (!/already exists/u.test(error.message)) {
        console.error('🚨 FATAL ERROR: No se pudo inicializar Firebase Admin en ms-geo');
        console.error('Verifica que tu FIREBASE_PRIVATE_KEY y credenciales sean correctas.');
        console.error(error.message);
        
        // Apagamos el servicio porque sin Firebase no hay validación de tokens operativos
        process.exit(1); 
    }
}

export default admin;