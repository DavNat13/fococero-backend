export const reportesPaths = {
  "/api/reportes": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Listar Reportes (Paginados)",
      description:
        "Recupera todos los reportes de incidentes. Los administradores ven todo el listado, mientras que los ciudadanos ven los reportes de su zona (lógica interna del service).",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          description: "Cantidad de registros a retornar",
          required: false,
          schema: { type: "integer", default: 10 },
        },
        {
          name: "offset",
          in: "query",
          description: "Cantidad de registros a saltar",
          required: false,
          schema: { type: "integer", default: 0 },
        },
      ],
      responses: {
        "200": {
          description: "Listado obtenido con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Reporte" },
                  },
                  paginacion: {
                    type: "object",
                    properties: {
                      total: { type: "integer", example: 100 },
                      limit: { type: "integer", example: 10 },
                      offset: { type: "integer", example: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Crear Nuevo Reporte",
      description:
        "Permite registrar un incidente. El ID del ciudadano se extrae automáticamente del token de Firebase para mayor seguridad.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "categoria_id",
                "titulo",
                "descripcion",
                "latitud",
                "longitud",
              ],
              properties: {
                categoria_id: {
                  type: "string",
                  format: "uuid",
                  example: "550e8400-e29b-41d4-a716-446655440000",
                },
                titulo: {
                  type: "string",
                  example: "Humo denso en ladera de cerro",
                },
                descripcion: {
                  type: "string",
                  example: "Se aprecia fuego cerca de torres de alta tensión.",
                },
                latitud: { type: "number", example: -33.045 },
                longitud: { type: "number", example: -71.612 },
                metadata: {
                  type: "object",
                  description:
                    "Datos dinámicos adicionales (clima, fotos, etc.)",
                  properties: {
                    clima_momento: { type: "string", example: "Despejado" },
                    temperatura: { type: "number", example: 28.5 },
                    fotos_urls: {
                      type: "array",
                      items: { type: "string" },
                      example: ["https://bucket.s3/foto1.jpg"],
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Reporte creado exitosamente" },
        "400": { description: "Error de validación (Zod)" },
      },
    },
  },
  "/api/reportes/{id}": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Detalle de Reporte",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID único del reporte",
        },
      ],
      responses: {
        "200": { description: "Detalle obtenido" },
        "404": { description: "El reporte solicitado no existe" },
      },
    },
  },
  "/api/reportes/{id}/estado": {
    patch: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Cambiar Estado (Operativo)",
      description:
        "Acción reservada para personal autorizado. Registra automáticamente un historial de auditoría.",
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
              required: ["nuevoEstado"],
              properties: {
                nuevoEstado: {
                  type: "string",
                  enum: ["PENDIENTE", "EN_PROCESO", "RESUELTO", "FALSA_ALARMA"],
                  example: "EN_PROCESO",
                },
                comentarios: {
                  type: "string",
                  example: "Se despacha primera unidad de bomberos.",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado actualizado con trazabilidad completa" },
        "403": {
          description: "Un ciudadano no tiene permisos para esta acción",
        },
      },
    },
  },
};

export const reportesSchemas = {
  Reporte: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      categoria_id: { type: "string", format: "uuid" },
      titulo: { type: "string" },
      descripcion: { type: "string" },
      latitud: { type: "number" },
      longitud: { type: "number" },
      estado: { type: "string", example: "PENDIENTE" },
      id_ciudadano: { type: "string" },
      created_at: { type: "string", format: "date-time" },
      ubicacion: {
        type: "object",
        description: "Objeto GeoJSON generado por PostGIS",
        properties: {
          type: { type: "string", example: "Point" },
          coordinates: {
            type: "array",
            items: { type: "number" },
            example: [-71.612, -33.045],
          },
        },
      },
    },
  },
};
