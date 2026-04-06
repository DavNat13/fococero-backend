export const geoPaths = {
  "/api/geo": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Obtener todos los focos activos",
      description:
        "Recupera el listado completo de incidentes geolocalizados que no han sido eliminados lógicamente.",
      responses: {
        "200": {
          description: "Listado de focos obtenido exitosamente",
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
      summary: "Reportar Foco (Ciudadano)",
      description:
        "Crea un nuevo reporte de incendio. El motor GeoHelper calculará automáticamente la severidad basada en el viento y la amenaza a viviendas.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["latitud", "longitud", "tipo_incidente"],
              properties: {
                latitud: { type: "number", example: -33.4372 },
                longitud: { type: "number", example: -70.6506 },
                tipo_incidente: {
                  type: "string",
                  example: "Incendio Forestal",
                },
                detalles: {
                  type: "string",
                  example: "Fuego cerca de zona residencial",
                },
                viento_velocidad_kmh: { type: "number", example: 25 },
                viento_direccion: { type: "string", example: "Norte" },
                amenaza_viviendas: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Incendio reportado y geolocalizado con éxito" },
        "400": { description: "Error de validación en los datos espaciales" },
      },
    },
  },
  "/api/geo/cercanos": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Radar PostGIS (Búsqueda por Radio)",
      description:
        "Utiliza funciones espaciales para encontrar focos dentro de un radio en metros desde un punto dado.",
      parameters: [
        {
          name: "lat",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -33.4372,
        },
        {
          name: "lng",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -70.6506,
        },
        {
          name: "radio",
          in: "query",
          required: true,
          schema: { type: "integer" },
          example: 5000,
          description: "Radio en metros",
        },
      ],
      responses: {
        "200": { description: "Focos cercanos encontrados" },
        "400": { description: "Faltan parámetros espaciales obligatorios" },
      },
    },
  },
  "/api/geo/{id}": {
    get: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Detalle de un Reporte",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        "200": { description: "Detalle del reporte obtenido" },
        "404": { description: "Reporte no encontrado o eliminado" },
      },
    },
    put: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Actualización Integral",
      description:
        "Actualiza variables climáticas y de riesgo. Recalcula severidad automáticamente.",
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
        "200": { description: "Información integral actualizada" },
      },
    },
    delete: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Eliminación Lógica (Soft Delete)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        "200": { description: "Reporte removido del mapa táctico" },
      },
    },
  },
  "/api/geo/{id}/estado": {
    patch: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Cambiar Estado Operativo",
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
              required: ["estado"],
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
                  example: "En Combate",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado operativo actualizado" },
      },
    },
  },
  "/api/geo/{id}/perimetro": {
    patch: {
      tags: ["Geolocalización (ms-geo)"],
      summary: "Actualizar Perímetro (WKT Polígono)",
      description:
        "Permite trazar el área afectada usando formato Well-Known Text (WKT).",
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
              required: ["area_quemada_wkt"],
              properties: {
                area_quemada_wkt: {
                  type: "string",
                  example:
                    "POLYGON((-70.65 -33.43, -70.64 -33.43, -70.64 -33.44, -70.65 -33.44, -70.65 -33.43))",
                  description: "Polígono en formato WKT",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Perímetro espacial actualizado en PostGIS" },
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
      perimetro_wkt: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
};
