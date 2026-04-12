// api-gateway/src/docs/multimedia.swagger.ts

export const multimediaSchemas = {
  Archivo: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
      url_publica: {
        type: "string",
        format: "uri",
        example: "https://storage.googleapis.com/fococero/reportes/foto.webp",
      },
      formato: { type: "string", example: "image/webp" },
      peso_bytes: { type: "integer", example: 1024500 },
      id_usuario: { type: "string", example: "firebase-uid-123" },
      contexto: { type: "string", example: "reporte" },
      es_huerfano: { type: "boolean", example: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
};

export const multimediaPaths = {
  "/api/multimedia/upload": {
    post: {
      summary: "Subir y comprimir una nueva imagen (Nace Huérfana)",
      tags: ["Multimedia (ms-multimedia)"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                archivo: {
                  type: "string",
                  format: "binary",
                  description: "Imagen a subir (JPG, PNG, WEBP). Max 10MB.",
                },
                contexto: {
                  type: "string",
                  enum: [
                    "reporte",
                    "alerta",
                    "perfil_ciudadano",
                    "evidencia_brigada",
                  ],
                  default: "reporte",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Archivo procesado exitosamente.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Archivo procesado y subido con éxito.",
                  },
                  data: { $ref: "#/components/schemas/Archivo" },
                },
              },
            },
          },
        },
        413: { description: "El archivo supera los 10MB." },
      },
    },
  },
  "/api/multimedia/{id}/vincular": {
    patch: {
      summary: "Vincular un archivo huérfano a una entidad",
      description:
        "Quita la marca de 'huérfano' de un archivo, indicando que ya pertenece a un reporte o alerta consolidada.",
      tags: ["Multimedia (ms-multimedia)"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "Archivo vinculado correctamente." },
        404: { description: "Archivo no encontrado." },
      },
    },
  },
  "/api/multimedia/{id}": {
    delete: {
      summary: "Eliminar un archivo lógicamente (Soft Delete)",
      tags: ["Multimedia (ms-multimedia)"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "Archivo eliminado correctamente." },
        404: { description: "Archivo no encontrado o ya estaba eliminado." },
      },
    },
  },
  "/api/multimedia/internal/cleanup": {
    get: {
      summary: "Limpieza interna (Barrendero de Huérfanos)",
      description:
        "Busca y elimina físicamente de Firebase los archivos huérfanos que llevan más de 24 horas sin ser reclamados.",
      tags: ["Multimedia (ms-multimedia)"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Proceso de limpieza finalizado.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Proceso de limpieza finalizado.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      huerfanos_encontrados: { type: "integer", example: 15 },
                      eliminados_firebase: { type: "integer", example: 15 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
