import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  AUTH_SERVICE_URL: z.string().url(),
  GEO_SERVICE_URL: z.string().url(),
  ALERTAS_SERVICE_URL: z.string().url(),
  REPORTES_SERVICE_URL: z.string().url(),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000"),

  // 👇 NUEVO: Blindaje para las credenciales de Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, "Falta el Project ID de Firebase"),
  FIREBASE_CLIENT_EMAIL: z.string().email("El email de Firebase no es válido"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "Falta la Private Key de Firebase"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    "❌ CRÍTICO: Variables de entorno inválidas o faltantes en el API Gateway:",
  );
  console.error(_env.error.format());
  process.exit(1);
}

export const envs = _env.data;
