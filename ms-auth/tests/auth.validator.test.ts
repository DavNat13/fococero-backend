/**
 * Pruebas unitarias para el validador de autenticación (AuthValidator)
 *
 * @module auth.validator
 */

import { describe, it, expect } from '@jest/globals';
import { AuthValidator } from '../src/validators/auth.validator';
import { UserRole, UserStatus } from '../src/models/user.enum';

describe('AuthValidator - Validación de entrada', () => {
    // ============================================================================
    // 🟢 validateGuest
    // ============================================================================
    describe('validateGuest', () => {
        it('✅ debería validar datos correctos de invitado', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('✅ debería validar RUT con K mayúscula (10.000.013-K)', () => {
            const result = AuthValidator.validateGuest({
                rut: '10.000.013-K',
                nombre: 'María',
                apellido: 'González',
                telefono: '987654321',
            });
            expect(result.isValid).toBe(true);
        });

        it('✅ debería validar RUT con k minúscula', () => {
            const result = AuthValidator.validateGuest({
                rut: '10.000.013-k',
                nombre: 'Carlos',
                apellido: 'López',
                telefono: '955667788',
            });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar RUT inválido (dígito verificador incorrecto)', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-9',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('RUT');
        });

        it('✅ debería validar RUT con DV 0 (10.000.004-0)', () => {
            const result = AuthValidator.validateGuest({
                rut: '10.000.004-0',
                nombre: 'Test',
                apellido: 'Zero',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar RUT con formato incorrecto', () => {
            const result = AuthValidator.validateGuest({
                rut: '123',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('RUT');
        });

        it('❌ debería rechazar nombre vacío', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: '',
                apellido: 'Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('nombre');
        });

        it('❌ debería rechazar nombre con números', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: 'Juan123',
                apellido: 'Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('nombre');
        });

        it('❌ debería rechazar apellido con caracteres especiales', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: '@Pérez',
                telefono: '912345678',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('apellido');
        });

        it('❌ debería rechazar teléfono con menos de 9 dígitos', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '12345',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('teléfono');
        });

        it('✅ debería aceptar teléfono con +56', () => {
            const result = AuthValidator.validateGuest({
                rut: '12.345.678-5',
                nombre: 'Ana',
                apellido: 'Martínez',
                telefono: '+56912345678',
            });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar datos incompletos', () => {
            const result = AuthValidator.validateGuest({} as any);
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================================================
    // 🟢 validateFullRegister
    // ============================================================================
    describe('validateFullRegister', () => {
        it('✅ debería validar registro completo correcto', () => {
            const result = AuthValidator.validateFullRegister({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
                token: 'valid-firebase-token-12345',
            });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar token muy corto', () => {
            const result = AuthValidator.validateFullRegister({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
                token: 'short',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('token');
        });

        it('❌ debería rechazar token vacío', () => {
            const result = AuthValidator.validateFullRegister({
                rut: '12.345.678-5',
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '912345678',
                token: '',
            });
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================================================
    // 🟢 validateGoogleAuth
    // ============================================================================
    describe('validateGoogleAuth', () => {
        it('✅ debería validar token de Google correcto', () => {
            const result = AuthValidator.validateGoogleAuth({ token: 'google-token-12345-valid' });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar token de Google muy corto', () => {
            const result = AuthValidator.validateGoogleAuth({ token: 'short' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Google');
        });

        it('❌ debería rechazar token vacío', () => {
            const result = AuthValidator.validateGoogleAuth({ token: '' });
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================================================
    // 🟢 validateLogin
    // ============================================================================
    describe('validateLogin', () => {
        it('✅ debería validar credenciales correctas', () => {
            const result = AuthValidator.validateLogin({
                rut: '12.345.678-5',
                password: 'secreta123',
            });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar contraseña menor a 6 caracteres', () => {
            const result = AuthValidator.validateLogin({ rut: '12.345.678-5', password: '12345' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('6 caracteres');
        });

        it('❌ debería rechazar RUT inválido', () => {
            const result = AuthValidator.validateLogin({
                rut: '12.345.678-9',
                password: 'secreta123',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('RUT');
        });
    });

    // ============================================================================
    // 🟡 validateProfileUpdate
    // ============================================================================
    describe('validateProfileUpdate', () => {
        it('✅ debería validar datos de perfil correctos', () => {
            const result = AuthValidator.validateProfileUpdate({
                nombre: 'NuevoNombre',
            });
            expect(result.isValid).toBe(true);
        });

        it('✅ debería aceptar actualización parcial vacía', () => {
            const result = AuthValidator.validateProfileUpdate({});
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar nombre con números en actualización', () => {
            const result = AuthValidator.validateProfileUpdate({
                nombre: 'Nombre123',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('nombre');
        });

        it('❌ debería rechazar RUT inválido en actualización', () => {
            const result = AuthValidator.validateProfileUpdate({
                rut: '12.345.678-9',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('RUT');
        });

        it('❌ debería rechazar teléfono inválido en actualización', () => {
            const result = AuthValidator.validateProfileUpdate({
                telefono: '123',
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('teléfono');
        });
    });

    // ============================================================================
    // 🟢 validatePerfilBrigadista
    // ============================================================================
    describe('validatePerfilBrigadista', () => {
        it('✅ debería validar datos de brigadista correctos', () => {
            const result = AuthValidator.validatePerfilBrigadista({
                organismo: 'Bomberos',
                rango: 'Capitán',
                zona_asignada: 'Santiago',
                numero_placa: 'B-123',
                fecha_ingreso: '2024-01-15',
            });
            expect(result.isValid).toBe(true);
        });

        it('✅ debería aceptar objeto vacío (todo opcional)', () => {
            const result = AuthValidator.validatePerfilBrigadista({});
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar organismo muy corto', () => {
            const result = AuthValidator.validatePerfilBrigadista({ organismo: 'A' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('organismo');
        });

        it('❌ debería rechazar fecha en formato incorrecto', () => {
            const result = AuthValidator.validatePerfilBrigadista({ fecha_ingreso: '15-01-2024' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('formato ISO');
        });
    });

    // ============================================================================
    // 🔴 validateRoleChange
    // ============================================================================
    describe('validateRoleChange', () => {
        it('✅ debería validar cambio de rol correcto', () => {
            const result = AuthValidator.validateRoleChange({ rol: UserRole.ADMIN });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar rol inválido', () => {
            const result = AuthValidator.validateRoleChange({ rol: 'supersecret' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('rol');
        });

        it('❌ debería rechazar rol vacío', () => {
            const result = AuthValidator.validateRoleChange({});
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================================================
    // 🔴 validateStatusChange
    // ============================================================================
    describe('validateStatusChange', () => {
        it('✅ debería validar cambio de estado correcto', () => {
            const result = AuthValidator.validateStatusChange({ estado: UserStatus.ACTIVO });
            expect(result.isValid).toBe(true);
        });

        it('❌ debería rechazar estado inválido', () => {
            const result = AuthValidator.validateStatusChange({ estado: 'nonexistent' });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('estado');
        });
    });
});
