// api-gateway/src/docs/swagger.ts

import { authPaths } from "./auth.swagger";
import { geoPaths, geoSchemas } from "./geo.swagger";
import { alertasPaths, alertasSchemas } from "./alertas.swagger";
import { reportesPaths, reportesSchemas } from "./reportes.swagger";
import { multimediaPaths, multimediaSchemas } from "./multimedia.swagger";
import { emergenciasPaths, emergenciasSchemas } from "./emergencias.swagger";
import { analiticaPaths, analiticaSchemas } from "./analitica.swagger"; // 🚀 Nuevo

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FocoCero API Gateway - Centro de Control Total",
    version: "1.0.0",
    description:
      "Documentación técnica unificada para la gestión de incendios forestales, seguridad cívica y orquestación de emergencias.",
    contact: {
      name: "Equipo Backend FocoCero",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local (Gateway)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "MODO TEST: Usa 'fococero_test_token' para saltar Firebase en desarrollo.",
      },
      InternalApiKey: {
        type: "apiKey",
        in: "header",
        name: "x-internal-token",
        description:
          "Token de seguridad Zero-Trust para comunicación entre microservicios.",
      },
    },
    schemas: {
      ...geoSchemas,
      ...alertasSchemas,
      ...reportesSchemas,
      ...multimediaSchemas,
      ...emergenciasSchemas,
      ...analiticaSchemas,
    },
  },
  tags: [
    {
      name: "Autenticación (ms-auth)",
      description: "Registro de ciudadanos y gestión de identidades.",
    },
    {
      name: "Geolocalización (ms-geo)",
      description:
        "Motor espacial PostGIS para el monitoreo de focos en tiempo real.",
    },
    {
      name: "Multimedia (ms-multimedia)",
      description:
        "Procesamiento y optimización de imágenes (Sharp/Firebase Storage).",
    },
    {
      name: "Alertas (ms-alertas)",
      description:
        "Sistema de notificaciones, verificación de focos y lógica de negocio.",
    },
    {
      name: "Reportes (ms-reportes)",
      description: "Gestión de informes de incendios y estadísticas.",
    },
    {
      name: "Emergencias (ms-emergencias)",
      description:
        "Orquestación crítica: Despacho a Bomberos, CONAF, SAMU y Carabineros.",
    },
    {
      name: "Analítica (ms-analitica)",
      description: "Motor de BI, Predicción de incidentes y Análisis Espacial.",
    },
  ],
  paths: {
    ...authPaths,
    ...geoPaths,
    ...alertasPaths,
    ...reportesPaths,
    ...multimediaPaths,
    ...emergenciasPaths,
    ...analiticaPaths,
  },
};
