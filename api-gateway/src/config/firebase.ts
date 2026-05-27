import * as admin from "firebase-admin";
import { envs } from "./envs";
import { logger } from "./logger";

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: envs.FIREBASE_PROJECT_ID,
        clientEmail: envs.FIREBASE_CLIENT_EMAIL,
        privateKey: envs.FIREBASE_PRIVATE_KEY,
      }),
    });
    logger.info("🔥 Firebase Admin SDK vinculado al API Gateway");
  }
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : "Error desconocido";
  logger.error("🚨 FATAL: No se pudo conectar con Firebase en el Gateway: " + msg);
  process.exit(1);
}

export default admin;
