/**
 * Pruebas unitarias para el helper de RUT chileno
 *
 * @module rut.helper
 */

import { describe, it, expect } from '@jest/globals';
import { RutHelper } from '../src/helpers/rut.helper';

describe('RutHelper - Utilidades de RUT chileno', () => {
    // ============================================================================
    // clean
    // ============================================================================
    describe('clean', () => {
        it('✅ debería limpiar puntos y guión de un RUT completo', () => {
            expect(RutHelper.clean('12.345.678-5')).toBe('123456785');
        });

        it('✅ debería limpiar RUT con espacios', () => {
            expect(RutHelper.clean(' 12.345.678-5 ')).toBe('123456785');
        });

        it('✅ debería convertir k minúscula a K mayúscula', () => {
            expect(RutHelper.clean('13.893.178-k')).toBe('13893178K');
        });

        it('✅ debería retornar string vacío para entrada vacía', () => {
            expect(RutHelper.clean('')).toBe('');
        });

        it('✅ debería retornar string vacío para null/undefined', () => {
            expect(RutHelper.clean(null as any)).toBe('');
            expect(RutHelper.clean(undefined as any)).toBe('');
        });

        it('✅ debería eliminar todos los caracteres no alfanuméricos excepto k/K', () => {
            expect(RutHelper.clean('12.345.678-5')).toBe('123456785');
        });
    });

    // ============================================================================
    // format
    // ============================================================================
    describe('format', () => {
        it('✅ debería formatear RUT con guión', () => {
            expect(RutHelper.format('123456785')).toBe('12345678-5');
        });

        it('✅ debería formatear RUT pre-limpio con K', () => {
            expect(RutHelper.format('13893178K')).toBe('13893178-K');
        });

        it('✅ debería formatear RUT con puntos y guión', () => {
            expect(RutHelper.format('12.345.678-5')).toBe('12345678-5');
        });

        it('✅ debería retornar el mismo valor si solo tiene 1 carácter', () => {
            expect(RutHelper.format('5')).toBe('5');
        });

        it('✅ debería retornar vacío si la entrada está vacía después de limpiar', () => {
            expect(RutHelper.format('')).toBe('');
        });
    });
});
