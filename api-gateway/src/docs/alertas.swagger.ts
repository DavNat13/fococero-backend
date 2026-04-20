// api-gateway/src/docs/alertas.swagger.ts

export const alertasPaths = {
  // ============================================================================
  // 🟢 🔵 ACCESO GENERAL (Cualquier usuario autenticado)
  // ============================================================================
  "/api/alertas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Panel General de Alertas (Operativo)",
      description:
        "Obtiene el listado maestro de todas las alertas registradas. Requiere rol de Brigadista o Admin.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de alertas obtenida con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Alerta" },
                  },
                },
              },
            },
          },
        },
        "403": { description: "Prohibido - No tienes permisos suficientes." },
      },
    },
    post: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Emitir nueva alerta",
      description:
        "Permite a un usuario autenticado reportar un incidente con coordenadas exactas.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["tipo", "gravedad", "descripcion", "ubicacion"],
              properties: {
                foco_id: { type: "string", format: "uuid", nullable: true },
                tipo: {
                  type: "string",
                  enum: ["INCENDIO", "HUMO", "SOSPECHA"],
                },
                gravedad: {
                  type: "string",
                  enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
                },
                descripcion: { type: "string" },
                ubicacion: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "Point" },
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      example: [-70.65, -33.43],
                    },
                  },
                },
                imagenes: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Alerta registrada con éxito" } },
    },
  },

  "/api/alertas/mis-alertas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Historial de mis alertas (Ciudadano)",
      description:
        "Retorna únicamente las alertas emitidas por el usuario autenticado (extraído del token).",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Historial personal obtenido" } },
    },
  },

  "/api/alertas/cercanas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Radar espacial de alertas",
      description:
        "Obtiene las alertas cercanas a una coordenada utilizando el motor de PostGIS.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "lng",
          in: "query",
          required: true,
          schema: { type: "number" },
          description: "Longitud (X)",
        },
        {
          name: "lat",
          in: "query",
          required: true,
          schema: { type: "number" },
          description: "Latitud (Y)",
        },
        {
          name: "radio",
          in: "query",
          required: false,
          schema: { type: "integer", default: 5000 },
          description: "Radio de búsqueda en metros (Max 50.000)",
        },
      ],
      responses: { "200": { description: "Alertas cercanas obtenidas" } },
    },
  },

  // ============================================================================
  // 🟠 🔴 ACCESO ESPECÍFICO Y OPERATIVO
  // ============================================================================
  "/api/alertas/{id}": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Ver detalle de una alerta",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        "200": { description: "Detalle obtenido" },
        "404": { description: "Alerta no encontrada" },
      },
    },
    delete: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Eliminar Alerta (ADMIN)",
      description:
        "Realiza un borrado lógico (Soft Delete). Solo para Administradores.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: { "200": { description: "Alerta eliminada del mapa" } },
    },
  },

  "/api/alertas/{id}/verificar": {
    post: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Confirmación en terreno (Táctico)",
      description:
        "Endpoint utilizado por brigadistas para confirmar si la alerta ciudadana es un incendio real o una falsa alarma.",
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
              required: ["esFuegoConfirmado"],
              properties: { esFuegoConfirmado: { type: "boolean" } },
            },
          },
        },
      },
      responses: {
        "200": { description: "Verificación procesada correctamente" },
      },
    },
  },

  "/api/alertas/{id}/estado": {
    patch: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Actualizar estado operativo",
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
              required: ["estado"],
              properties: {
                estado: {
                  type: "string",
                  enum: [
                    "REPORTADA",
                    "EN_REVISION",
                    "DERIVADA",
                    "RESUELTA",
                    "DESCARTADA",
                  ],
                },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Estado actualizado exitosamente" } },
    },
  },
};

export const alertasSchemas = {
  Alerta: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      usuario_id: { type: "string" },
      foco_id: { type: "string", format: "uuid", nullable: true },
      tipo: { type: "string" },
      gravedad: { type: "string" },
      estado: { type: "string" },
      descripcion: { type: "string" },
      ubicacion: {
        type: "object",
        properties: {
          type: { type: "string", example: "Point" },
          coordinates: {
            type: "array",
            items: { type: "number" },
            example: [-70.65, -33.43],
          },
        },
      },
      fecha_creacion: { type: "string", format: "date-time" },
    },
  },
};
