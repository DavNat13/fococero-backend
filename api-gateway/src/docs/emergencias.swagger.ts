// api-gateway/src/docs/emergencias.swagger.ts

export const emergenciasSchemas = {
  DespachoRequest: {
    type: "object",
    required: [
      "alerta_id",
      "correlation_id",
      "organismo",
      "prioridad",
      "request_payload",
      "endpoint_url",
    ],
    properties: {
      alerta_id: { type: "string", format: "uuid" },
      correlation_id: { type: "string", format: "uuid" },
      organismo: {
        type: "string",
        enum: ["BOMBEROS", "CONAF", "SAMU", "CARABINEROS"],
      },
      prioridad: { type: "string", enum: ["ALTA", "MEDIA", "BAJA"] },
      endpoint_url: { type: "string", format: "uri" },
      request_payload: { type: "object" },
    },
  },
  EstadoUpdateRequest: {
    type: "object",
    required: ["estado"],
    properties: {
      estado: {
        type: "string",
        enum: ["PENDIENTE", "EXITOSO", "FALLIDO", "REINTENTANDO"],
        description: "El nuevo estado del despacho reportado por el webhook",
      },
    },
  },
};

export const emergenciasPaths = {
  "/api/emergencias/despachos": {
    post: {
      tags: ["Emergencias (ms-emergencias)"],
      summary: "Crear y ejecutar un nuevo despacho",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/DespachoRequest" },
          },
        },
      },
      responses: {
        201: { description: "Despacho procesado e iniciado correctamente" },
        400: { description: "Datos inválidos (Zod Validator)" },
      },
    },
  },
  "/api/emergencias/despachos/retry": {
    post: {
      tags: ["Emergencias (ms-emergencias)"],
      summary: "Reintentar despachos fallidos (Manual/CronJob)",
      description: "Dispara manualmente el reintento concurrente de todos los despachos que quedaron en estado FALLIDO.",
      security: [{ bearerAuth: [] }],
      responses: {
        202: { description: "Proceso de reintento iniciado en segundo plano" },
      },
    },
  },
  "/api/emergencias/despachos/{correlation_id}": {
    get: {
      tags: ["Emergencias (ms-emergencias)"],
      summary: "Consultar estado de un despacho específico",
      parameters: [
        {
          name: "correlation_id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "El ID de trazabilidad del despacho a consultar",
        },
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Estado de despacho recuperado exitosamente" },
        404: { description: "No se encontró registro de despacho para este ID" },
      },
    },
  },
  "/api/emergencias/despachos/{id}/estado": {
    patch: {
      tags: ["Emergencias (ms-emergencias)"],
      summary: "Actualizar estado del despacho (Webhooks Asíncronos)",
      description: "Recibe actualizaciones de estado de organismos externos (ej. Bomberos/CONAF) indicando si la unidad va en camino o falló.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID interno del log de despacho (Base de datos)",
        },
      ],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EstadoUpdateRequest" },
          },
        },
      },
      responses: {
        200: { description: "Estado actualizado correctamente" },
      },
    },
  },
};