import app from "./app";
import { envs } from "./config/envs";
import { dbPool, checkDbConnection } from "./config/db";
import { redisCache } from "./config/redis";
import { eurekaClient, initEureka } from "./config/eureka";
import { Logger } from "./helpers/logger.helper";

const PORT = envs.PORT || 3007;

/**
 * Función principal de arranque (Bootstrap)
 */
async function bootstrap() {
  try {
    Logger.info(`====================================================`);
    Logger.info(`📊 INICIANDO MS-ANALITICA (FocoCero Process)`);
    Logger.info(`====================================================`);

    // 1. Verificación de Salud de la Infraestructura
    await checkDbConnection();
    Logger.info(`✅ [POSTGRES] Conexión establecida.`);

    // 2. Encendido del Servidor
    const server = app.listen(PORT, () => {
      Logger.info(`🚀 [SERVER] Escuchando en puerto: ${PORT}`);
      Logger.info(`📡 [ENV] Modo: ${envs.NODE_ENV}`);
      Logger.info(`📖 [DOCS] http://localhost:${PORT}/api/v1/analitica/docs`);

      // 3. Registro en Service Discovery
      initEureka();
    });

    // ============================================================================
    // 🛑 GESTIÓN DE CIERRE CONTROLADO (ORQUESTACIÓN SENIOR)
    // ============================================================================
    const handleShutdown = async (signal: string) => {
      Logger.info(
        `⚠️  [${signal}] Señal de apagado recibida. Iniciando Graceful Shutdown...`,
      );

      // Paso A: Retirarse de Eureka (Inmediato para el Gateway)
      eurekaClient.stop((eurekaError) => {
        if (eurekaError)
          Logger.error("❌ [EUREKA] Error al desregistrar:", eurekaError);
        else Logger.info("✅ [EUREKA] Retirado de la malla de servicios.");

        // Paso B: Dejar de aceptar nuevas conexiones HTTP
        server.close(async () => {
          Logger.info("✅ [SERVER] Servidor HTTP detenido.");

          try {
            // Paso C: Cerrar Redis (Usa el wrapper del index original)
            const wrapper = redisCache as any;
            if (wrapper.client?.quit) {
              await wrapper.client.quit();
              Logger.info("✅ [REDIS] Conexión cerrada.");
            }

            // Paso D: Cerrar PostgreSQL
            await dbPool.end();
            Logger.info("✅ [POSTGRES] Pool de conexiones liberado.");

            Logger.info("👋 [SISTEMA] Apagado completado de forma segura.");
            process.exit(0);
          } catch (err) {
            Logger.error(
              "❌ [ERROR] Fallo durante el cierre de recursos:",
              err,
            );
            process.exit(1);
          }
        });
      });

      // Timeout de seguridad: Si no cierra en 10s, forzar salida
      setTimeout(() => {
        Logger.error("🔥 [FATAL] El cierre tardó demasiado. Forzando salida.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (criticalError) {
    const errorMsg = criticalError instanceof Error ? criticalError.message : String(criticalError);
    Logger.error(`❌ [FATAL] Error durante el arranque: ${errorMsg}`, criticalError);
    process.exit(1);
  }
}

// Ejecutar el proceso
bootstrap();
