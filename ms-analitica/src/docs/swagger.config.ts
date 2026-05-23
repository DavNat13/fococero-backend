import { OpenAPIV3 } from "openapi-types";

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "FocoCero - Microservicio de Analítica Proactiva",
    version: "1.0.0",
    description:
      "API de alta disponibilidad para el análisis de incidentes, predicción de riesgos y procesamiento geoespacial.",
    contact: {
      name: "Ingeniería FocoCero",
      email: "dev@fococero.cl",
    },
  },
  servers: [
    {
      url: "/api/v1/analitica",
      description: "Servidor Principal",
    },
  ],
  components: {
    schemas: {
      StatsQuery: {
        type: "object",
        required: ["startDate", "endDate"],
        properties: {
          startDate: {
            type: "string",
            format: "date-time",
            description: "Fecha inicio (ISO 8601)",
          },
          endDate: {
            type: "string",
            format: "date-time",
            description: "Fecha fin (ISO 8601)",
          },
          categorias: {
            type: "array",
            items: { type: "string" },
            description: "Lista de categorías separadas por coma",
          },
          severidad: { type: "string", enum: ["ALTA", "MEDIA", "BAJA"] },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          exito: { type: "boolean" },
          mensaje: { type: "string" },
          datos: { type: "object" },
        },
      },
    },
  },
  paths: {
    // --- MÓDULO CORE (4 Endpoints) ---
    "/core/kpis": {
      get: {
        tags: ["Módulo Core"],
        summary: "Obtener KPIs principales",
        description:
          "Calcula total de incidentes, promedios de respuesta y nivel de riesgo global.",
        responses: { 200: { description: "KPIs generados" } },
      },
    },
    "/core/tendencias": {
      get: {
        tags: ["Módulo Core"],
        summary: "Serie de tiempo de incidentes",
        description: "Retorna datos agrupados por día para gráficos de líneas.",
        responses: { 200: { description: "Tendencias generadas" } },
      },
    },
    "/core/distribucion": {
      get: {
        tags: ["Módulo Core"],
        summary: "Distribución por categorías",
        description: "Porcentaje y conteo de incidentes según su tipo.",
        responses: { 200: { description: "Distribución calculada" } },
      },
    },
    "/core/anomalias": {
      get: {
        tags: ["Módulo Core"],
        summary: "Detección de anomalías (ML)",
        description:
          "Identifica picos estadísticos inusuales en el comportamiento de los incidentes.",
        responses: { 200: { description: "Análisis completado" } },
      },
    },

    // --- MÓDULO ESPACIAL (3 Endpoints) ---
    "/espacial/heatmap": {
      get: {
        tags: ["Módulo Espacial"],
        summary: "Mapa de Calor (GeoJSON)",
        description:
          "Retorna una FeatureCollection para renderizar mapas de calor.",
        responses: { 200: { description: "GeoJSON entregado" } },
      },
    },
    "/espacial/geohash/{geohash}": {
      get: {
        tags: ["Módulo Espacial"],
        summary: "Detalle por zona Geohash",
        parameters: [
          {
            name: "geohash",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Detalle de zona" } },
      },
    },
    "/espacial/radio": {
      get: {
        tags: ["Módulo Espacial"],
        summary: "Incidentes en radio circular",
        description:
          "Busca incidentes dentro de un radio en metros desde un punto lat/lng.",
        responses: { 200: { description: "Resultados encontrados" } },
      },
    },

    // --- MÓDULO PREDICTIVO (1 Endpoint) ---
    "/predictiva/pronostico": {
      get: {
        tags: ["Módulo Predictivo"],
        summary: "Pronóstico a 7 días",
        description:
          "Predice la carga de incidentes para la próxima semana usando medias móviles.",
        responses: { 200: { description: "Predicción generada" } },
      },
    },

    // --- MÓDULO EXPORTACIÓN (2 Endpoints) ---
    "/exportar/csv": {
      get: {
        tags: ["Exportación"],
        summary: "Exportar a CSV",
        responses: { 200: { description: "Archivo CSV generado" } },
      },
    },
    "/exportar/pdf": {
      get: {
        tags: ["Exportación"],
        summary: "Generar Reporte PDF",
        responses: { 200: { description: "Documento PDF generado" } },
      },
    },

    // --- MÓDULO METADATOS (3 Endpoints) ---
    "/metadatos/categorias": {
      get: {
        tags: ["Metadatos"],
        summary: "Catálogo de categorías",
        responses: { 200: { description: "Lista de categorías" } },
      },
    },
    "/metadatos/origenes": {
      get: {
        tags: ["Metadatos"],
        summary: "Fuentes de datos activas",
        responses: { 200: { description: "Lista de orígenes" } },
      },
    },
    "/metadatos/severidades": {
      get: {
        tags: ["Metadatos"],
        summary: "Niveles de severidad permitidos",
        responses: { 200: { description: "Lista de severidades" } },
      },
    },

    // --- MÓDULO SISTEMA (4 Endpoints) ---
    "/salud/ping": {
      get: {
        tags: ["Sistema"],
        summary: "Health Check",
        responses: { 200: { description: "Servicio operativo" } },
      },
    },
    "/cache/limpiar": {
      delete: {
        tags: ["Sistema"],
        summary: "Vaciar caché de Redis",
        description:
          "Elimina todas las entradas de analítica en el caché distribuido.",
        responses: { 204: { description: "Caché invalidado" } },
      },
    },
    "/db/refrescar-vistas": {
      post: {
        tags: ["Sistema"],
        summary: "Refrescar vistas materializadas",
        description: "Fuerza la actualización de los agregados en PostgreSQL.",
        responses: { 202: { description: "Actualización en curso" } },
      },
    },
    "/alertas/test": {
      post: {
        tags: ["Sistema"],
        summary: "Test de notificaciones",
        description: "Envía una alerta de prueba al sistema de notificaciones.",
        responses: { 200: { description: "Prueba exitosa" } },
      },
    },
  },
};
