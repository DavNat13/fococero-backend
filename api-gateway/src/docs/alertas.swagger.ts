export const alertasPaths = {
  "/api/alertas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Panel General de Alertas (Solo Brigadistas/Admin)",
      description:
        "Obtiene el listado maestro de todas las alertas registradas en el sistema que no han sido borradas lógicamente.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de alertas obtenida con éxito",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean", example: true },
                  resultados: { type: "integer", example: 10 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Alerta" },
                  },
                },
              },
            },
          },
        },
        "401": { description: "No autorizado - Token faltante o inválido" },
        "403": {
          description: "Prohibido - No tienes permisos de Brigadista o Admin",
        },
      },
    },
    post: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Emitir Alerta (Ciudadano)",
      description:
        "Permite a un usuario autenticado reportar un incidente proporcionando coordenadas exactas y descripción.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["tipo", "descripcion", "ubicacion"],
              properties: {
                tipo: {
                  type: "string",
                  enum: [
                    "INCENDIO",
                    "MICROBASURAL",
                    "VEGETACION_SECA",
                    "ALUMBRADO_DEFECTUOSO",
                    "OTRO",
                  ],
                  example: "INCENDIO",
                },
                descripcion: {
                  type: "string",
                  example: "Se observa humo negro saliendo de la quebrada.",
                },
                ubicacion: {
                  type: "object",
                  required: ["type", "coordinates"],
                  properties: {
                    type: { type: "string", example: "Point" },
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      example: [-71.612, -33.045],
                      description: "[longitud, latitud]",
                    },
                  },
                },
                gravedad: {
                  type: "string",
                  enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
                  example: "MEDIA",
                },
                imagenes: {
                  type: "array",
                  items: { type: "string" },
                  example: ["url_imagen_1.jpg"],
                },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Alerta registrada con éxito" },
        "400": { description: "Error en los datos (ej: faltan coordenadas)" },
      },
    },
  },
  "/api/alertas/mis-alertas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Mi Historial de Alertas",
      description:
        "Recupera todas las alertas emitidas por el usuario logueado actualmente.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Historial recuperado" },
      },
    },
  },
  "/api/alertas/cercanas": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Radar PostGIS (Alertas Cercanas)",
      description:
        "Busca alertas en un radio kilométrico utilizando funciones espaciales de PostGIS.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "lng",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -71.612,
        },
        {
          name: "lat",
          in: "query",
          required: true,
          schema: { type: "number" },
          example: -33.045,
        },
        {
          name: "radio",
          in: "query",
          required: false,
          schema: { type: "integer", default: 5000 },
          description: "Radio en metros",
        },
      ],
      responses: {
        "200": { description: "Lista de alertas en el radio especificado" },
        "400": { description: "Coordenadas inválidas o radio superior a 50km" },
      },
    },
  },
  "/api/alertas/{id}": {
    get: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Detalle de Alerta",
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
        "200": { description: "Detalle de la alerta obtenido" },
        "404": { description: "Alerta no encontrada" },
      },
    },
    delete: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Borrado Lógico (Solo Admin)",
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
        "200": { description: "Alerta eliminada del mapa" },
        "404": { description: "La alerta no existe o ya fue borrada" },
      },
    },
  },
  "/api/alertas/{id}/verificar": {
    post: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Confirmación en Terreno (Táctico)",
      description:
        "Endpoint utilizado por brigadistas para confirmar si un reporte es fuego real o falsa alarma.",
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
              properties: {
                esFuegoConfirmado: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Verificación procesada (Estado actualizado)" },
      },
    },
  },
  "/api/alertas/{id}/estado": {
    patch: {
      tags: ["Alertas (ms-alertas)"],
      summary: "Gestión Operativa de Estado",
      description:
        "Actualiza el flujo de trabajo de la alerta (ej: de REPORTADA a EN_REVISION).",
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
                  example: "EN_REVISION",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado actualizado exitosamente" },
      },
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
      tipo: { type: "string", example: "INCENDIO" },
      gravedad: { type: "string", example: "ALTA" },
      estado: { type: "string", example: "REPORTADA" },
      descripcion: { type: "string" },
      ubicacion: {
        type: "object",
        properties: {
          type: { type: "string" },
          coordinates: { type: "array", items: { type: "number" } },
        },
      },
      fecha_creacion: { type: "string", format: "date-time" },
    },
  },
};
