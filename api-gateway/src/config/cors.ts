import { CorsOptions } from "cors";
import { envs } from "./envs";

// Lista blanca dinámica basada en envs
const allowedOrigins = envs.CORS_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir si no hay origin (como herramientas de testeo/Postman) o si está en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `🚫 Bloqueado por seguridad (CORS): Origen ${origin} no permitido.`,
        ),
      );
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-trace-id",
  ],
  credentials: true,
  maxAge: 86400, // Cache de preflight de 24 horas para mejorar rendimiento
};
