import app from "./app";
import { envs } from "./config/envs";
import { dbPool, checkDbConnection } from "./config/db";
import { redisCache } from "./config/redis";

const PORT = envs.PORT || 3007;

// ============================================================================
// 🚀 ARRANQUE DEL SERVIDOR
// ============================================================================
const server = app.listen(PORT, async () => {
  console.log(`\n====================================================`);
  console.log(`📊 MICROSERVICIO MS-ANALITICA (FocoCero) ACTIVADO`);
  console.log(`📡 Puerto: ${PORT} | Entorno: ${envs.NODE_ENV}`);

  // 1. Verificación de salud de la Base de Datos
  await checkDbConnection(); // Usa el helper de tu db.ts

  console.log(`🧠 Inteligencia Proactiva y Análisis Espacial Listos`);
  console.log(`🛡️  Seguridad: Escudos Zero-Trust y Cache Activos`);
  console.log(`📖 Docs: http://localhost:${PORT}/api/v1/analitica/docs`);
  console.log(`====================================================\n`);
});

// ============================================================================
// 🛑 CIERRE CONTROLADO (GRACEFUL SHUTDOWN)
// ============================================================================
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Apagando ms-analitica (${signal})...`);

  server.close(async () => {
    try {
      // Cerrar Pool de PostgreSQL
      await dbPool.end();
      console.log("✅ Conexión a PostgreSQL cerrada.");

      // Cerrar Redis de forma segura
      const wrapper = redisCache as unknown as {
        client?: { quit: () => Promise<void> };
      };
      if (wrapper.client && typeof wrapper.client.quit === "function") {
        await wrapper.client.quit();
        console.log("✅ Conexión a Redis cerrada.");
      }

      process.exit(0);
    } catch (err) {
      console.error("❌ Error durante el cierre:", err);
      process.exit(1);
    }
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
