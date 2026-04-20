// ms-multimedia/src/docs/swagger.ts

import swaggerJSDoc from 'swagger-jsdoc';
import { envs } from '../config/envs';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'FocoCero - API Multimedia',
        version: '1.0.0',
        description:
            'Microservicio encargado de comprimir imágenes con Sharp, subirlas a Firebase Storage y gestionar su ciclo de vida (huérfanos/vinculados) en PostgreSQL.',
        contact: {
            name: 'Equipo Backend FocoCero',
        },
    },
    servers: [
        {
            url: `http://localhost:${envs.PORT}/api/v1/multimedia`,
            description: 'Servidor de Desarrollo Local',
        },
    ],
    components: {
        securitySchemes: {
            // Simulamos la inyección de headers que hace el API Gateway
            GatewayUser: {
                type: 'apiKey',
                in: 'header',
                name: 'x-user-id',
                description:
                    'ID del usuario (Normalmente inyectado por el API Gateway tras validar Firebase Auth)',
            },
        },
        schemas: {
            Archivo: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '550e8400-e29b-41d4-a716-446655440000',
                    },
                    url_publica: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://storage.googleapis.com/fococero/reportes/foto.webp',
                    },
                    formato: { type: 'string', example: 'image/webp' },
                    peso_bytes: { type: 'integer', example: 1024500 },
                    id_usuario: { type: 'string', example: 'firebase-uid-123' },
                    contexto: { type: 'string', example: 'reporte' },
                    es_huerfano: { type: 'boolean', example: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Mensaje de error descriptivo' },
                    detalles: { type: 'object', nullable: true },
                },
            },
        },
    },
    paths: {
        '/upload': {
            post: {
                summary: 'Subir y comprimir una nueva imagen (Nace Huérfana)',
                tags: ['Archivos'],
                security: [{ GatewayUser: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    archivo: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Imagen a subir (JPG, PNG, WEBP). Max 10MB.',
                                    },
                                    contexto: {
                                        type: 'string',
                                        enum: [
                                            'reporte',
                                            'alerta',
                                            'perfil_ciudadano',
                                            'evidencia_brigada',
                                        ],
                                        default: 'reporte',
                                        description:
                                            'Carpeta o contexto lógico al que pertenece la imagen.',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Archivo procesado y subido exitosamente.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: {
                                            type: 'string',
                                            example: 'Archivo procesado y subido con éxito.',
                                        },
                                        data: { $ref: '#/components/schemas/Archivo' },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Datos inválidos o falta el archivo.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                    413: {
                        description: 'El archivo supera los 10MB.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/{id}/vincular': {
            patch: {
                summary: 'Vincular un archivo huérfano a una entidad (Adopción)',
                tags: ['Archivos'],
                security: [{ GatewayUser: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'ID UUID del archivo en la base de datos.',
                    },
                ],
                responses: {
                    200: { description: 'Archivo vinculado correctamente.' },
                    404: { description: 'Archivo no encontrado.' },
                },
            },
        },
        '/{id}': {
            delete: {
                summary: 'Eliminar un archivo lógicamente (Soft-Delete)',
                tags: ['Archivos'],
                security: [{ GatewayUser: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    200: { description: 'Archivo eliminado correctamente.' },
                    404: { description: 'Archivo no encontrado.' },
                },
            },
        },
        '/internal/cleanup': {
            get: {
                summary: 'Limpieza interna de archivos huérfanos (CRONJOB)',
                tags: ['Operaciones Internas'],
                description:
                    'Busca archivos con más de 24 horas huérfanos, los elimina de Firebase y hace soft-delete en la BD.',
                responses: {
                    200: { description: 'Limpieza ejecutada correctamente.' },
                },
            },
        },
    },
};

const swaggerOptions: swaggerJSDoc.Options = {
    swaggerDefinition,
    apis: [], // No leemos rutas porque definimos todo directamente en el objeto superior
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
