import { Pool } from "pg";
import { envs } from "./envs";
import { Logger } from "../helpers/logger.helper";

export const dbPool = new Pool({
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  user: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  application_name: "ms-analitica-worker",
});

dbPool.on("error", (err) => {
  Logger.error("🔥 [DB] Fatal error en el Pool de Conexiones:", err);
  process.exit(-1);
});

export const checkDbConnection = async (): Promise<void> => {
  const client = await dbPool.connect();
  try {
    await client.query("SELECT 1");
    Logger.info("📦 PostgreSQL [Analítica] Conectado Exitosamente");
  } finally {
    client.release();
  }
};
