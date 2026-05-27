// api-gateway/src/config/envs.ts

import "dotenv/config";
import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // URLs de Microservicios
  AUTH_SERVICE_URL: z.string().url(),
  GEO_SERVICE_URL: z.string().url(),
  ALERTAS_SERVICE_URL: z.string().url(),
  REPORTES_SERVICE_URL: z.string().url(),
  MULTIMEDIA_SERVICE_URL: z.string().url(),
  EMERGENCIAS_SERVICE_URL: z.string().url(),
  ANALITICA_SERVICE_URL: z.string().url(),
  EUREKA_HOST: z.string().min(1),

  INTERNAL_SECRET_TOKEN: z.string().min(1),

  // Whitelist de CORS
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000"),

  // Seguridad: Firebase Admin SDK
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1)
    .transform((val) => val.replace(/\\n/g, "\n").replace(/"/g, "").trim()),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error("❌ CRÍTICO: Error en variables de entorno del API Gateway:");
  logger.error(_env.error.format());
  process.exit(1);
}

export const envs = _env.data;
