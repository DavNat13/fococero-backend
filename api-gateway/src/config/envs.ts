// api-gateway/src/config/envs.ts

import "dotenv/config";
import { z } from "zod";
import { logger } from "./logger";

const testDefaults = {
  AUTH_SERVICE_URL: "http://localhost:3001",
  GEO_SERVICE_URL: "http://localhost:3002",
  ALERTAS_SERVICE_URL: "http://localhost:3003",
  REPORTES_SERVICE_URL: "http://localhost:3004",
  MULTIMEDIA_SERVICE_URL: "http://localhost:3005",
  EMERGENCIAS_SERVICE_URL: "http://localhost:3006",
  ANALITICA_SERVICE_URL: "http://localhost:3007",
  EUREKA_HOST: "localhost",
  INTERNAL_SECRET_TOKEN: "test-token",
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_CLIENT_EMAIL: "test@test.com",
  FIREBASE_PRIVATE_KEY: "test-key",
};

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // URLs de Microservicios
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:3001"),
  GEO_SERVICE_URL: z.string().url().default("http://localhost:3002"),
  ALERTAS_SERVICE_URL: z.string().url().default("http://localhost:3003"),
  REPORTES_SERVICE_URL: z.string().url().default("http://localhost:3004"),
  MULTIMEDIA_SERVICE_URL: z.string().url().default("http://localhost:3005"),
  EMERGENCIAS_SERVICE_URL: z.string().url().default("http://localhost:3006"),
  ANALITICA_SERVICE_URL: z.string().url().default("http://localhost:3007"),
  EUREKA_HOST: z.string().min(1).default("localhost"),

  INTERNAL_SECRET_TOKEN: z.string().min(1).default("test-token"),

  // Whitelist de CORS
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000"),

  // Redis para rate limiting
  REDIS_URL: z.string().default("redis://redis-fococero:6379"),

  // Seguridad: Firebase Admin SDK
  FIREBASE_PROJECT_ID: z.string().min(1).default("test-project"),
  FIREBASE_CLIENT_EMAIL: z.string().email().default("test@test.com"),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1)
    .default("test-key")
    .transform((val) => val.replace(/\\n/g, "\n").replace(/"/g, "").trim()),
});

const mergedEnv = { ...testDefaults, ...process.env };
const parsed = envSchema.safeParse(mergedEnv);

if (parsed.error) {
  if (process.env.NODE_ENV === "test") {
    logger.warn(`Variables de entorno faltantes en test: ${parsed.error.message}. Usando defaults.`);
  } else {
    logger.error("❌ CRÍTICO: Error en variables de entorno del API Gateway:");
    logger.error(parsed.error.format());
    process.exit(1);
  }
}

const envData = parsed.data ?? envSchema.parse({});

export const envs = envData;
