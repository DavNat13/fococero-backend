import request from 'supertest';
import app from '../src/app';
import { envs } from '../src/config/envs';

// 1. Mockeamos el Logger para mantener la consola limpia
jest.mock('../src/helpers/logger', () => ({
    Logger: {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// 2. Mockeamos la Base de Datos (Esto evita el error 500 en /health)
jest.mock('../src/config/db', () => ({
    pool: {
        query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
        end: jest.fn().mockResolvedValue(undefined),
    },
}));

// 3. Mock de uuid
jest.mock('uuid', () => ({
    v4: () => 'test-correlation-id-1234',
}));

// 4. Mock del Repositorio
jest.mock('../src/repositories/despacho.repository', () => ({
    DespachoRepository: {
        create: jest.fn().mockResolvedValue({ id: 'mock-id-123', correlation_id: 'uuid-123' }),
        findByCorrelationId: jest
            .fn()
            .mockResolvedValue([{ id: 'mock-id-123', estado: 'PENDIENTE' }]),
        finish: jest.fn().mockResolvedValue(undefined),
        updateStatus: jest.fn().mockResolvedValue(undefined),
        getPendingRetries: jest.fn().mockResolvedValue([]),
        findById: jest.fn().mockResolvedValue({ id: '44444444-4444-4444-4444-444444444444', estado: 'PENDIENTE' }),
    },
}));

// 5. Mock de Axios/HttpClient
jest.mock('../src/config/httpClient', () => ({
    externalHttpClient: {
        post: jest.fn().mockResolvedValue({ data: { message: 'Success' }, duration_ms: 100 }),
    },
    httpClient: {
        post: jest.fn().mockResolvedValue({ data: { message: 'Success' }, duration_ms: 100 }),
    },
}));

describe('MS Emergencias | Integración de Despachos', () => {
    const API_PREFIX = '/api/v1/emergencias';
    const internalToken = envs.INTERNAL_SECRET_TOKEN || 'test_token';

    describe('GET /health', () => {
        it('Debería retornar 200 y saltarse la validación Zero-Trust', async () => {
            const res = await request(app).get('/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.message).toContain('ms-emergencias');
        });
    });

    describe('POST /api/v1/emergencias/despachos', () => {
        it('Debería rechazar la petición si no tiene el token interno (Zero-Trust)', async () => {
            const res = await request(app).post(`${API_PREFIX}/despachos`).send({});

            expect(res.statusCode).toBe(403);
            expect(res.body.ok).toBe(false);
        });

        it('Debería retornar 400 si el payload es inválido (Zod Validator)', async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/despachos`)
                .set('x-internal-token', internalToken)
                .send({ organismo: 'INVALIDO' });

            expect(res.statusCode).toBe(400);
            expect(res.body.ok).toBe(false);
        });

        it('Debería procesar un despacho exitoso con organismo válido', async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/despachos`)
                .set('x-internal-token', internalToken)
                .send({
                    alerta_id: '11111111-1111-1111-1111-111111111111',
                    correlation_id: '22222222-2222-2222-2222-222222222222',
                    organismo: 'BOMBEROS',
                    prioridad: 'ALTA',
                    endpoint_url: 'https://api.bomberos.cl/v1/dispatch',
                    request_payload: { direccion: 'Calle Falsa 123', comuna: 'Santiago' },
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.ok).toBe(true);
        });

        it('Debería fallar con organismo no configurado (SAMU → 500 por manejo de error genérico)', async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/despachos`)
                .set('x-internal-token', internalToken)
                .send({
                    alerta_id: '11111111-1111-1111-1111-111111111111',
                    correlation_id: '33333333-3333-3333-3333-333333333333',
                    organismo: 'SAMU',
                    prioridad: 'MEDIA',
                    endpoint_url: 'https://api.bomberos.cl/v1/dispatch',
                    request_payload: { ubicacion: 'test' },
                });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('GET /api/v1/emergencias/despachos/:correlationId', () => {
        it('Debería consultar estado de un despacho por correlation_id', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/despachos/test-correlation-id-1234`)
                .set('x-internal-token', internalToken);
            expect(res.statusCode).toBe(200);
            expect(res.body.ok).toBe(true);
        });
    });

    describe('PATCH /api/v1/emergencias/despachos/:id/estado', () => {
        it('Debería actualizar el estado de un despacho', async () => {
            const res = await request(app)
                .patch(`${API_PREFIX}/despachos/44444444-4444-4444-4444-444444444444/estado`)
                .set('x-internal-token', internalToken)
                .send({ estado: 'PROCESANDO' });
            expect(res.statusCode).toBe(200);
        });
    });
});
