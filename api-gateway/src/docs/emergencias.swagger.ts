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
};

export const emergenciasPaths = {
  "/emergencias/despachos": {
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
        201: { description: "Despacho iniciado" },
        400: { description: "Datos inválidos" },
      },
    },
  },
  "/emergencias/despachos/{correlation_id}": {
    get: {
      tags: ["Emergencias (ms-emergencias)"],
      summary: "Consultar estado de un despacho",
      parameters: [
        {
          name: "correlation_id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Estado recuperado" },
      },
    },
  },
};
