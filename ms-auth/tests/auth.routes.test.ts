/**
 * Pruebas de integración para las rutas de autenticación (HTTP)
 *
 * @module auth.routes
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// ============================================================================
// Mocks inline - SIN referencias a variables externas
// Accedemos a los mocks via jest.requireMock
// ============================================================================
jest.mock('../src/config/firebase', () => {
    // Mantenemos una referencia interna mutable
    const auth = {
        verifyIdToken: jest.fn(),
        createCustomToken: jest.fn(),
        setCustomUserClaims: jest.fn(),
    };
    return { __esModule: true, default: { auth: () => auth } };
});

jest.mock('../src/repositories/user.repository', () => ({
    UserRepository: {
        findByRut: jest.fn(),
        findByFirebaseUid: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        findByFirebaseUidOrRut: jest.fn(),
        findAll: jest.fn(),
        createGuest: jest.fn(),
        createFullUser: jest.fn(),
        update: jest.fn(),
        updateFirebaseUid: jest.fn(),
        updateFcmToken: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('../src/repositories/perfil-brigadista.repository', () => ({
    PerfilBrigadistaRepository: {
        findByUsuarioId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(() => Promise.resolve(true)),
    genSalt: jest.fn(() => Promise.resolve('salt')),
    hash: jest.fn(() => Promise.resolve('hashed-password')),
}));

jest.mock('../src/config/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

// ============================================================================
// Referencias a mocks via requireMock
// ============================================================================
function getFirebaseMock() {
    return (jest.requireMock('../src/config/firebase') as any).default.auth();
}

function getUserRepoMock() {
    return (jest.requireMock('../src/repositories/user.repository') as any).UserRepository;
}

function getBcryptMock() {
    return jest.requireMock('bcryptjs') as any;
}

import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';
import { errorHandler } from '../src/middlewares/error.middleware';

// ============================================================================
// App de prueba
// ============================================================================
const app = express();
app.use(express.json());
app.use('/', authRoutes);
app.use(errorHandler);

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('Rutas de autenticación - HTTP Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /login', () => {
        it('debería autenticar usuario con credenciales válidas', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();
            const firebase = getFirebaseMock();

            userRepo.findByRut.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Juan',
                password: 'hashed',
                firebase_uid: 'firebase-uid',
                rol: 'usuario',
                estado: 'activo',
            });
            bcrypt.compare.mockResolvedValue(true);
            firebase.createCustomToken.mockResolvedValue('custom-token');
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const response = await request(app)
                .post('/login')
                .send({ rut: '12.345.678-5', password: 'secreta123' });

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it('debería retornar 401 con credenciales inválidas', async () => {
            const userRepo = getUserRepoMock();
            userRepo.findByRut.mockResolvedValue(null);

            const response = await request(app)
                .post('/login')
                .send({ rut: '12.345.678-5', password: 'wrongpassword' });

            expect(response.status).toBe(401);
        });

        it('debería retornar 400 con RUT inválido', async () => {
            const response = await request(app)
                .post('/login')
                .send({ rut: 'invalido', password: '123456' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /register-guest', () => {
        it('debería registrar un nuevo invitado', async () => {
            const userRepo = getUserRepoMock();
            const bcrypt = getBcryptMock();

            userRepo.findByRut.mockResolvedValue(null);
            userRepo.createGuest.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Juan',
                rol: 'invitado',
            });

            const response = await request(app)
                .post('/register-guest')
                .send({
                    rut: '12.345.678-5',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    telefono: '912345678',
                });

            expect(response.status).toBe(201);
        });

        it('debería retornar 400 si faltan datos', async () => {
            const response = await request(app)
                .post('/register-guest')
                .send({ rut: '12.345.678-5' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /register-full', () => {
        it('debería registrar usuario completo', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'firebase-u', email: 'test@test.cl' });
            userRepo.findByFirebaseUidOrRut.mockResolvedValue(null);
            userRepo.createFullUser.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Juan',
                rol: 'usuario',
            });
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const response = await request(app)
                .post('/register-full')
                .send({
                    rut: '12.345.678-5',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    telefono: '912345678',
                    token: 'valid-firebase-token-12345',
                });

            expect(response.status).toBe(201);
        });
    });

    describe('POST /google', () => {
        it('debería autenticar con Google', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({
                uid: 'google-uid-123',
                email: 'test@example.com',
                name: 'Test User',
            });
            userRepo.findByFirebaseUid.mockResolvedValue(null);
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.createFullUser.mockResolvedValue({
                id: 1,
                rut: 'GGGOOGLEUI',
                nombre: 'Test',
                apellido: 'User',
                rol: 'usuario',
            });
            firebase.setCustomUserClaims.mockResolvedValue(undefined);

            const response = await request(app)
                .post('/google')
                .send({ token: 'valid-google-token-for-testing' });
            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it('debería retornar 400 sin token', async () => {
            const response = await request(app).post('/google').send({});
            expect(response.status).toBe(400);
        });
    });

    describe('Rutas protegidas', () => {
        it('GET /me debería retornar 401 sin token', async () => {
            const response = await request(app).get('/me');
            expect(response.status).toBe(401);
        });

        it('GET /me debería retornar 403 cuando el usuario no existe en DB', async () => {
            // Sin mock, verifyIdToken retorna undefined → find(undefined) → no user → 403
            const response = await request(app)
                .get('/me')
                .set('Authorization', 'Bearer some-token');
            expect(response.status).toBe(403);
        });

        it('GET /me debería retornar perfil con token válido', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'valid-uid' });
            userRepo.findByFirebaseUid.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                estado: 'activo',
            });
            userRepo.findById.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                estado: 'activo',
            });

            const response = await request(app)
                .get('/me')
                .set('Authorization', 'Bearer valid-token');
            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });
    });

    describe('Rutas de administración', () => {
        it('GET /users debería retornar 401 sin token', async () => {
            const response = await request(app).get('/users');
            expect(response.status).toBe(401);
        });

        it('GET /users debería retornar 403 si no es admin', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'user-uid' });
            userRepo.findByFirebaseUid.mockResolvedValue({
                id: 2,
                rut: '87654321-5',
                nombre: 'User',
                rol: 'usuario',
                estado: 'activo',
            });

            const response = await request(app)
                .get('/users')
                .set('Authorization', 'Bearer user-token');
            expect(response.status).toBe(403);
        });

        it('GET /users debería retornar lista si es admin', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'admin-uid' });
            userRepo.findByFirebaseUid.mockResolvedValue({
                id: 1,
                rut: '11111111-1',
                nombre: 'Admin',
                rol: 'admin',
                estado: 'activo',
            });
            userRepo.findAll.mockResolvedValue([
                { id: 1, nombre: 'Admin' },
                { id: 2, nombre: 'User' },
            ]);

            const response = await request(app)
                .get('/users')
                .set('Authorization', 'Bearer admin-token');
            expect(response.status).toBe(200);
            expect(response.body.total).toBe(2);
        });
    });

    describe('Catch-all 404', () => {
        it('debería retornar 404 para rutas inexistentes (con token válido)', async () => {
            const firebase = getFirebaseMock();
            const userRepo = getUserRepoMock();

            firebase.verifyIdToken.mockResolvedValue({ uid: 'valid-uid' });
            userRepo.findByFirebaseUid.mockResolvedValue({
                id: 1,
                rut: '12345678-5',
                nombre: 'Test',
                estado: 'activo',
            });

            const response = await request(app)
                .get('/ruta-que-no-existe')
                .set('Authorization', 'Bearer valid-token');
            expect(response.status).toBe(404);
        });

        it('debería retornar 401 para rutas inexistentes sin token', async () => {
            const response = await request(app).get('/ruta-que-no-existe');
            expect(response.status).toBe(401);
        });
    });
});
