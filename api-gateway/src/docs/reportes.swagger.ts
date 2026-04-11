// api-gateway/src/docs/reportes.swagger.ts

export const reportesPaths = {
  // --- CATEGORÍAS ---
  "/api/reportes/categorias": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Obtener catálogo de categorías de incidentes",
      description:
        "Retorna la lista de categorías activas (Ej: Incendio Forestal, Quema Ilegal) con sus niveles de prioridad.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Catálogo obtenido",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Categoria" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // --- REPORTES GENERALES ---
  "/api/reportes": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Listar todos los reportes (Paginado)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
        },
        {
          name: "offset",
          in: "query",
          schema: { type: "integer", default: 0 },
        },
      ],
      responses: { "200": { description: "Listado obtenido" } },
    },
    post: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Crear nuevo reporte ciudadano",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["titulo", "latitud", "longitud", "categoria_id"],
              properties: {
                titulo: { type: "string" },
                descripcion: { type: "string" },
                latitud: { type: "number" },
                longitud: { type: "number" },
                categoria_id: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Reporte creado exitosamente" } },
    },
  },

  "/api/reportes/me": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Obtener mis reportes enviados",
      description:
        "Filtra automáticamente los reportes asociados al UID del token del ciudadano.",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Listado personal obtenido" } },
    },
  },

  "/api/reportes/{id}": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Obtener detalle de un reporte",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: { "200": { description: "Detalle del reporte" } },
    },
    patch: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Actualizar información del reporte",
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
                titulo: { type: "string" },
                descripcion: { type: "string" },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Reporte actualizado" } },
    },
    delete: {
      tags: ["Reportes (ms-reportes)"],
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
      responses: { "200": { description: "Reporte eliminado" } },
    },
  },

  // --- ZONA OPERATIVA ---
  "/api/reportes/{id}/estado": {
    patch: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Cambiar estado operativo y registrar historial",
      description:
        "Solo Brigadistas o Admins. Genera automáticamente una entrada en la tabla de auditoría.",
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
                nuevoEstado: {
                  type: "string",
                  enum: ["PENDIENTE", "EN_PROCESO", "RESUELTO", "FALSA_ALARMA"],
                },
                comentarios: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado actualizado con trazabilidad completa" },
      },
    },
  },

  "/api/reportes/{id}/historial": {
    get: {
      tags: ["Reportes (ms-reportes)"],
      summary: "Ver trazabilidad/historial de cambios",
      description:
        "Muestra quién, cuándo y por qué cambió el estado del incidente.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: { "200": { description: "Historial de auditoría obtenido" } },
    },
  },
};

export const reportesSchemas = {
  Categoria: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      nombre: { type: "string" },
      nivel_prioridad: { type: "integer" },
    },
  },
  Reporte: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      titulo: { type: "string" },
      estado: { type: "string" },
      ubicacion: { type: "object", description: "GeoJSON de PostGIS" },
    },
  },
};
