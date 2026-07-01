/**
 * Pruebas unitarias para PerfilBrigadistaRepository (pool de BD mockeado)
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockQuery: any = jest.fn();
jest.mock('../src/config/database', () => ({
    pool: { query: mockQuery },
}));

import { PerfilBrigadistaRepository } from '../src/repositories/perfil-brigadista.repository';

describe('PerfilBrigadistaRepository - Repositorio de perfiles brigadista', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findByUsuarioId', () => {
        it('debería retornar perfil si existe', async () => {
            mockQuery.mockResolvedValue({
                rows: [{ id: 1, usuario_id: 1, organismo: 'Bomberos' }],
            });
            const result = await PerfilBrigadistaRepository.findByUsuarioId(1);
            expect(result).toBeDefined();
        });

        it('debería retornar null si no existe', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await PerfilBrigadistaRepository.findByUsuarioId(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('debería crear un perfil de brigadista', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, organismo: 'Bomberos' }] });
            const result = await PerfilBrigadistaRepository.create({
                usuario_id: 1,
                organismo: 'Bomberos',
            });
            expect(result.id).toBe(1);
        });
    });

    describe('update', () => {
        it('debería actualizar un perfil existente', async () => {
            mockQuery.mockResolvedValue({ rows: [{ id: 1, organismo: 'Carabineros' }] });
            const result: any = await PerfilBrigadistaRepository.update(1, {
                organismo: 'Carabineros',
            });
            expect(result.organismo).toBe('Carabineros');
        });
    });
});
