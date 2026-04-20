// ms-multimedia/tests/multimedia.test.ts

import request from 'supertest';
import express from 'express';
import multimediaRoutes from '../src/routes/multimedia.routes';
import { errorHandler } from '../src/middlewares/errorHandler';

// ==========================================
// 🛡️ MOCKS DE DEPENDENCIAS EXTERNAS
// ==========================================

// Mock de Sharp: Simula el procesamiento de imagen sin usar la CPU
jest.mock('sharp', () => () => ({
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-webp-image-buffer')),
}));

// Mock de Firebase Admin: Simula la subida a la nube
jest.mock('../src/config/firebase', () => ({
    bucket: {
        file: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(true),
            makePublic: jest.fn().mockResolvedValue(true),
        }),
        name: 'fococero-test-bucket',
    },
}));

// Mock del Repositorio: Simula la base de datos PostgreSQL
jest.mock('../src/repositories/archivo.repository', () => ({
    ArchivoRepository: {
        crear: jest.fn().mockResolvedValue({
            id: '550e8400-e29b-41d4-a716-446655440000',
            url_publica: 'https://storage.googleapis.com/fococero/test.webp',
            es_huerfano: true,
        }),
        vincularEntidad: jest.fn().mockResolvedValue({
            id: '550e8400-e29b-41d4-a716-446655440000',
            es_huerfano: false,
        }),
        eliminarLogico: jest.fn().mockResolvedValue(true),
        obtenerHuerfanosExpirados: jest.fn().mockResolvedValue([]),
    },
}));

// ==========================================
// ⚙️ CONFIGURACIÓN DEL ENTORNO DE PRUEBA
// ==========================================

const app = express();
app.use(express.json());

// Simulamos la inyección de cabeceras que haría el API Gateway
app.use((req, _res, next) => {
    req.headers['x-user-id'] = 'test-uid-123';
    req.headers['x-user-role'] = 'ciudadano';
    next();
});

// Rutas y Error Handler
app.use('/api/v1/multimedia', multimediaRoutes);
app.use(errorHandler);

// Silenciamos los logs de error de la consola para mantener un reporte limpio
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

// ==========================================
// 🧪 SUITE DE PRUEBAS
// ==========================================

describe('🖼️ Multimedia Microservice Tests', () => {
    describe('POST /api/v1/multimedia/upload', () => {
        it('✅ Debería subir y procesar una imagen correctamente', async () => {
            const response = await request(app)
                .post('/api/v1/multimedia/upload')
                // Simulamos el envío de un archivo binario
                .attach('archivo', Buffer.from('fake-image-data'), 'foto_incendio.jpg')
                .field('contexto', 'reporte');

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.url_publica).toContain('.webp');
        });

        it('❌ Debería fallar con 400 si no se envía el archivo', async () => {
            const response = await request(app)
                .post('/api/v1/multimedia/upload')
                .send({ contexto: 'reporte' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('No se proporcionó ningún archivo');
        });
    });

    describe('PATCH /api/v1/multimedia/:id/vincular', () => {
        it('✅ Debería vincular un archivo si el UUID es válido', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const response = await request(app).patch(`/api/v1/multimedia/${validUuid}/vincular`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('exitosamente');
        });

        it('❌ Debería fallar si el ID proporcionado no es un UUID', async () => {
            const response = await request(app).patch(
                '/api/v1/multimedia/id-invalido-123/vincular',
            );

            expect(response.status).toBe(400);
            // Validamos que el error venga de nuestro validateSchema (Zod)
            expect(response.body.error).toBe('Datos de formulario inválidos o faltantes.');
            expect(response.body.detalles[0].mensaje).toContain('UUID válido');
        });
    });

    describe('DELETE /api/v1/multimedia/:id', () => {
        it('✅ Debería realizar el borrado lógico correctamente', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const response = await request(app).delete(`/api/v1/multimedia/${validUuid}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('eliminado');
        });
    });

    describe('GET /api/v1/multimedia/internal/cleanup', () => {
        it('✅ Debería responder correctamente al proceso de limpieza', async () => {
            const response = await request(app).get('/api/v1/multimedia/internal/cleanup');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
