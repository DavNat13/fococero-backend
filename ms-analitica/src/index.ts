import app from "./app";
import { envs } from "./config/envs";
import { dbPool, checkDbConnection } from "./config/db";
import { redisCache } from "./config/redis";
import { eurekaClient, initEureka } from "./config/eureka";

const PORT = envs.PORT || 3007;

/**
 * Función principal de arranque (Bootstrap)
 */
async function bootstrap() {
  try {
    console.log(`\n====================================================`);
    console.log(`📊 INICIANDO MS-ANALITICA (FocoCero Process)`);
    console.log(`====================================================`);

    // 1. Verificación de Salud de la Infraestructura
    await checkDbConnection();
    console.log(`✅ [POSTGRES] Conexión establecida.`);

    // 2. Encendido del Servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Escuchando en puerto: ${PORT}`);
      console.log(`📡 [ENV] Modo: ${envs.NODE_ENV}`);
      console.log(`📖 [DOCS] http://localhost:${PORT}/api/v1/analitica/docs`);

      // 3. Registro en Service Discovery
      initEureka();
    });

    // ============================================================================
    // 🛑 GESTIÓN DE CIERRE CONTROLADO (ORQUESTACIÓN SENIOR)
    // ============================================================================
    const handleShutdown = async (signal: string) => {
      console.log(
        `\n⚠️  [${signal}] Señal de apagado recibida. Iniciando Graceful Shutdown...`,
      );

      // Paso A: Retirarse de Eureka (Inmediato para el Gateway)
      eurekaClient.stop((eurekaError) => {
        if (eurekaError)
          console.error("❌ [EUREKA] Error al desregistrar:", eurekaError);
        else console.log("✅ [EUREKA] Retirado de la malla de servicios.");

        // Paso B: Dejar de aceptar nuevas conexiones HTTP
        server.close(async () => {
          console.log("✅ [SERVER] Servidor HTTP detenido.");

          try {
            // Paso C: Cerrar Redis (Usa el wrapper del index original)
            const wrapper = redisCache as any;
            if (wrapper.client?.quit) {
              await wrapper.client.quit();
              console.log("✅ [REDIS] Conexión cerrada.");
            }

            // Paso D: Cerrar PostgreSQL
            await dbPool.end();
            console.log("✅ [POSTGRES] Pool de conexiones liberado.");

            console.log("👋 [SISTEMA] Apagado completado de forma segura.\n");
            process.exit(0);
          } catch (err) {
            console.error(
              "❌ [ERROR] Fallo durante el cierre de recursos:",
              err,
            );
            process.exit(1);
          }
        });
      });

      // Timeout de seguridad: Si no cierra en 10s, forzar salida
      setTimeout(() => {
        console.error("🔥 [FATAL] El cierre tardó demasiado. Forzando salida.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (criticalError) {
    console.error(`\n❌ [FATAL] Error durante el arranque del microservicio:`);
    console.error(criticalError);
    process.exit(1);
  }
}

// Ejecutar el proceso
bootstrap();
