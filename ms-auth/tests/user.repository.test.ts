/**
 * Pruebas unitarias para UserRepository (pool de BD mockeado)
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockQuery: any = jest.fn();
jest.mock('../src/config/database', () => ({
    pool: { query: mockQuery },
}));

import { UserRepository } from '../src/repositories/user.repository';

describe('UserRepository - Repositorio de usuarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('debería retornar todos los usuarios', async () => {
            mockQuery.mockResolvedValue({
                rows: [
                    { id: 1, nombre: 'Juan' },
                    { id: 2, nombre: 'María' },
                ],
            });
            const result = await UserRepository.findAll();
            expect(result).toHaveLength(2);
        });
    });

    describe('findById', () => {
        it('debería retornar usuario si existe', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, nombre: 'Juan' }] });
            const result = await UserRepository.findById(1);
            expect(result).toBeDefined();
        });

        it('debería retornar null si no existe', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await UserRepository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('findByRut', () => {
        it('debería buscar por RUT', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, rut: '12345678-5' }] });
            const result = await UserRepository.findByRut('12345678-5');
            expect(result).toBeDefined();
        });
    });

    describe('findByFirebaseUid', () => {
        it('debería buscar por Firebase UID', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, firebase_uid: 'fb-uid' }] });
            const result = await UserRepository.findByFirebaseUid('fb-uid');
            expect(result).toBeDefined();
        });
    });

    describe('findByEmail', () => {
        it('debería buscar por email', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, email: 'test@test.cl' }] });
            const result = await UserRepository.findByEmail('test@test.cl');
            expect(result).toBeDefined();
        });
    });

    describe('findByFirebaseUidOrRut', () => {
        it('debería buscar por UID o RUT', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, firebase_uid: 'fb-uid' }] });
            const result = await UserRepository.findByFirebaseUidOrRut('fb-uid', '12345678-5');
            expect(result).toBeDefined();
        });
    });

    describe('createGuest', () => {
        it('debería insertar usuario invitado', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, rut: '12345678-5' }] });
            const result = await UserRepository.createGuest({
                rut: '12345678-5',
                nombre: 'Invitado',
            });
            expect(result.id).toBe(1);
        });
    });

    describe('createFullUser', () => {
        it('debería insertar usuario completo', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, rut: '12345678-5' }] });
            const result = await UserRepository.createFullUser({
                rut: '12345678-5',
                nombre: 'Juan',
                firebase_uid: 'fb-uid',
            });
            expect(result.id).toBe(1);
        });
    });

    describe('update', () => {
        it('debería actualizar campos permitidos', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, nombre: 'Actualizado' }] });
            const result = await UserRepository.update(1, { nombre: 'Actualizado' });
            expect(result).toBeDefined();
        });
    });

    describe('updateFirebaseUid', () => {
        it('debería actualizar Firebase UID', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, firebase_uid: 'new-uid' }] });
            const result = await UserRepository.updateFirebaseUid(1, 'new-uid', 'fcm-token');
            expect(result).toBeDefined();
        });
    });

    describe('updateFcmToken', () => {
        it('debería actualizar FCM token', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            await UserRepository.updateFcmToken(1, 'fcm-token-123');
            expect(mockQuery).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('debería eliminar usuario por ID', async () => {
            mockQuery.mockResolvedValue({ rowCount: 1 });
            await UserRepository.delete(1);
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});
