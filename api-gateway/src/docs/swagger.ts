// api-gateway/src/docs/swagger.ts

import { authPaths } from "./auth.swagger";
import { geoPaths, geoSchemas } from "./geo.swagger";
import { alertasPaths, alertasSchemas } from "./alertas.swagger";
import { reportesPaths, reportesSchemas } from "./reportes.swagger";
import { multimediaPaths, multimediaSchemas } from "./multimedia.swagger"; 

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FocoCero API Gateway - Centro de Control Total",
    version: "1.0.0",
    description:
      "Documentación técnica unificada para la gestión de incendios forestales y seguridad cívica.",
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
    },
    schemas: {
      ...geoSchemas,
      ...alertasSchemas,
      ...reportesSchemas,
      ...multimediaSchemas, 
    },
  },
  tags: [
    {
      name: "Autenticación (ms-auth)",
      description: "Registro de ciudadanos y gestión de identidades.",
    },
    {
      name: "Geolocalización (ms-geo)",
      description: "Motor espacial PostGIS para el monitoreo de focos.",
    },
    {
      name: "Multimedia (ms-multimedia)",
      description: "Procesamiento y optimización de imágenes (Sharp/Firebase).",
    }, 
    {
      name: "Alertas (ms-alertas)",
      description: "Sistema de notificaciones y verificación táctica.",
    },
    {
      name: "Reportes (ms-reportes)",
      description: "Gestión administrativa de incidentes e historial.",
    },
  ],
  paths: {
    ...authPaths,
    ...geoPaths,
    ...multimediaPaths, 
    ...alertasPaths,
    ...reportesPaths,
  },
};
