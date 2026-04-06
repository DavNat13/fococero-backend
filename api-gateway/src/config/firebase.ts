import * as admin from "firebase-admin";
import { envs } from "./envs";

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: envs.FIREBASE_PROJECT_ID,
      clientEmail: envs.FIREBASE_CLIENT_EMAIL,
      privateKey: envs.FIREBASE_PRIVATE_KEY,
    }),
  });

  console.log("🔥 Conectado exitosamente a Firebase Admin (Api-Gateway)");
} catch (error: any) {
  if (!/already exists/u.test(error.message)) {
    console.error(
      "❌ Error inicializando Firebase Admin en Api-Gateway:",
      error.message,
    );
  }
}

export default admin;
