// api-gateway/src/docs/geo.swagger.ts

export const geoPaths = {
  // ============================================================================
  // 🔓 ZONA CIUDADANA (Rutas Públicas)
  // ============================================================================
  "/api/geo": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Obtener mapa global de focos activos",
      description:
        "Recupera todos los incidentes geolocalizados que están en curso. Ideal para el mapa público de la App.",
      responses: {
        "200": {
          description: "Listado de focos obtenido con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UbicacionFoco" },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Reportar nuevo foco (Ciudadano)",
      description:
        "Crea un reporte de incendio inicial. El sistema calculará automáticamente la severidad basada en factores climáticos.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["latitud", "longitud", "tipo_incidente"],
              properties: {
                latitud: { type: "number", example: -33.4489 },
                longitud: { type: "number", example: -70.6693 },
                tipo_incidente: {
                  type: "string",
                  example: "Incendio Forestal",
                },
                detalles: {
                  type: "string",
                  example: "Humo negro visible desde la ruta.",
                },
                viento_velocidad_kmh: { type: "number", example: 15 },
                amenaza_viviendas: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Foco registrado y severidad calculada." },
        "400": {
          description: "Coordenadas fuera de rango (Chile) o datos inválidos.",
        },
      },
    },
  },

  "/api/geo/cercanos": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Radar de cercanía (PostGIS)",
      description:
        "Busca incidentes en un radio circular específico utilizando funciones geográficas de alta precisión.",
      parameters: [
        {
          name: "lat",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -35.42,
        },
        {
          name: "lng",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -71.65,
        },
        {
          name: "radio",
          in: "query",
          required: true,
          schema: { type: "integer" },
          description: "Distancia en metros (ej: 5000 para 5km)",
          example: 5000,
        },
      ],
      responses: {
        "200": { description: "Lista de focos dentro del radio de búsqueda." },
      },
    },
  },

  "/api/geo/{id}": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Detalle completo de un foco",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        "200": {
          description: "Datos detallados incluyendo perímetro WKT si existe.",
        },
        "404": { description: "El foco no existe o fue eliminado." },
      },
    },
    // ✅ Endpoint restaurado: Actualización Integral
    put: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Actualización integral (Brigadista)",
      description:
        "Permite modificar variables climáticas y de riesgo. El sistema recalculará la severidad del incendio.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                tipo_incidente: { type: "string" },
                detalles: { type: "string" },
                viento_velocidad_kmh: { type: "number" },
                amenaza_viviendas: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Incendio actualizado y severidad re-evaluada." },
      },
    },
    delete: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Eliminar reporte (Soft Delete)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: { "200": { description: "Reporte marcado como eliminado." } },
    },
  },

  // ============================================================================
  // 🛡️ ZONA OPERATIVA (Requiere Token)
  // ============================================================================
  "/api/geo/{id}/estado": {
    patch: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Cambiar estado operativo",
      description:
        "Actualiza el ciclo de vida del incendio (Ej: de 'Reportado' a 'En Combate').",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                estado: {
                  type: "string",
                  enum: [
                    "Reportado",
                    "En Evaluación",
                    "En Combate",
                    "Controlado",
                    "Extinguido",
                    "Falsa Alarma",
                  ],
                },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Estado actualizado exitosamente." } },
    },
  },

  "/api/geo/{id}/perimetro": {
    patch: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Actualizar polígono del área quemada",
      description:
        "Recibe una cadena en formato WKT para representar polígonos o multipolígonos espaciales.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                area_quemada_wkt: {
                  type: "string",
                  example:
                    "POLYGON((-71.6 -35.4, -71.5 -35.4, -71.5 -35.5, -71.6 -35.5, -71.6 -35.4))",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Perímetro guardado en la base de datos geográfica.",
        },
      },
    },
  },
};

export const geoSchemas = {
  UbicacionFoco: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      reporte_id: { type: "string" },
      tipo_incidente: { type: "string" },
      severidad: {
        type: "string",
        enum: ["Baja", "Moderada", "Alta", "Crítica"],
      },
      estado: { type: "string" },
      latitud: { type: "number" },
      longitud: { type: "number" },
      viento_velocidad_kmh: { type: "number" },
      amenaza_viviendas: { type: "boolean" },
      created_at: { type: "string", format: "date-time" },
    },
  },
};
