import { CorsOptions } from "cors";
import { envs } from "./envs";

// Convertimos el string "url1,url2" en un array limpio ['url1', 'url2']
const allowedOrigins = envs.CORS_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitimos peticiones locales (sin origin, como Postman) o si están en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `🚫 Bloqueado por CORS: El origen ${origin} no está autorizado.`,
        ),
      );
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200, // Previene problemas con navegadores legacy (SmartTVs, IE11)
};
