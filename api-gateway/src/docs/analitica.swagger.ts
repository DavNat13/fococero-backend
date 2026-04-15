// api-gateway/src/docs/analitica.swagger.ts

export const analiticaPaths = {
  // === CORE ===
  "/api/analitica/core/kpis": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "KPIs de gestión de emergencias",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/schemas/StatsQueryParams" }],
      responses: { "200": { description: "Estadísticas calculadas" } },
    },
  },
  "/api/analitica/core/tendencias": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Series de tiempo para gráficos",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Datos temporales listos" } },
    },
  },
  "/api/analitica/core/distribucion": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Distribución por categorías",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/analitica/core/anomalias": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Detección de anomalías",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Análisis de picos completado" } },
    },
  },

  // === ESPACIAL ===
  "/api/analitica/espacial/heatmap": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "GeoJSON para Mapa de Calor",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "FeatureCollection generada" } },
    },
  },
  "/api/analitica/espacial/geohash/{geohash}": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Detalle por zona Geohash",
      parameters: [
        {
          name: "geohash",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/analitica/espacial/radio": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Incidentes en radio circular",
      responses: { "200": { description: "OK" } },
    },
  },

  // === PREDICTIVA ===
  "/api/analitica/predictiva/pronostico": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Pronóstico de incidentes (7 días)",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Predicción calculada" } },
    },
  },

  // === EXPORTAR ===
  "/api/analitica/exportar/csv": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Descargar CSV",
      responses: { "200": { description: "Archivo CSV" } },
    },
  },
  "/api/analitica/exportar/pdf": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Generar Reporte PDF",
      responses: { "200": { description: "Reporte gerencial" } },
    },
  },

  // === METADATOS ===
  "/api/analitica/metadatos/categorias": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Catálogo de categorías",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/analitica/metadatos/origenes": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Catálogo de fuentes",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/analitica/metadatos/severidades": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Niveles de severidad",
      responses: { "200": { description: "OK" } },
    },
  },

  // === SISTEMA ===
  "/api/analitica/salud/ping": {
    get: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Health Check",
      responses: { "200": { description: "Pong" } },
    },
  },
  "/api/analitica/cache/limpiar": {
    delete: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Limpiar Caché",
      security: [{ bearerAuth: [] }],
      responses: { "204": { description: "Caché purgado" } },
    },
  },
  "/api/analitica/db/refrescar-vistas": {
    post: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Refrescar Vistas Materializadas",
      security: [{ bearerAuth: [] }],
      responses: { "202": { description: "Proceso iniciado" } },
    },
  },
  "/api/analitica/alertas/test": {
    post: {
      tags: ["Analítica (ms-analitica)"],
      summary: "Test de notificaciones",
      responses: { "200": { description: "OK" } },
    },
  },
};

export const analiticaSchemas = {
  StatsQueryParams: {
    type: "object",
    properties: {
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      categorias: {
        type: "string",
        description: "Categorías separadas por coma",
      },
      severidad: { type: "string", enum: ["ALTA", "MEDIA", "BAJA"] },
    },
  },
};
