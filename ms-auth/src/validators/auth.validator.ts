// ms-auth/src/validators/auth.validator.ts

import { RutHelper } from '../helpers/rut.helper';
import { UserRole, UserStatus } from '../models/user.enum';
import { Usuario } from '../models/user.model';

// Definición de Interfaces (Contratos de Entrada) para erradicar 'any'
export interface GuestRegisterDTO {
    rut: string;
    nombre: string;
    apellido: string;
    telefono: string;
}

export interface FullRegisterDTO extends GuestRegisterDTO {
    token: string;
}

/**
 * AuthValidator: Capa de sanitización y validación de entrada.
 * Aplica la filosofía "Zero Trust" (Nunca confíes en el frontend ni en la red).
 */
export class AuthValidator {
    /**
     * Valida el formato y el dígito verificador de un RUT chileno usando Módulo 11.
     */
    private static isValidRut(rut: string): boolean {
        const cleanRut = RutHelper.clean(rut);
        if (cleanRut.length < 8) return false;

        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toUpperCase();

        let suma = 0;
        let multiplo = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            suma += parseInt(body[i], 10) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }

        const dvEsperado = 11 - (suma % 11);
        let dvReal = '';
        if (dvEsperado === 11) dvReal = '0';
        else if (dvEsperado === 10) dvReal = 'K';
        else dvReal = dvEsperado.toString();

        return dv === dvReal;
    }

    // --- 🟢 VALIDADORES DE CREACIÓN ---

    // ✅ FIX: Reemplazo de 'any' por Interface explícita GuestRegisterDTO
    static validateGuest(data: GuestRegisterDTO): { isValid: boolean; error?: string } {
        const { rut, nombre, apellido, telefono } = data;

        if (!rut || !this.isValidRut(rut)) {
            return {
                isValid: false,
                error: 'El RUT ingresado no es válido o tiene un formato incorrecto.',
            };
        }

        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nombre || nombre.trim().length < 2 || !nameRegex.test(nombre)) {
            return {
                isValid: false,
                error: 'El nombre debe tener al menos 2 letras y no contener números.',
            };
        }
        if (!apellido || apellido.trim().length < 2 || !nameRegex.test(apellido)) {
            return {
                isValid: false,
                error: 'El apellido debe tener al menos 2 letras y no contener números.',
            };
        }

        const phoneRegex = /^[0-9]{9}$/;
        const cleanPhone = telefono?.replace(/\s/g, '').replace('+56', '');
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
            return {
                isValid: false,
                error: 'El teléfono debe ser un número de 9 dígitos (ej: 912345678).',
            };
        }

        return { isValid: true };
    }

    // ✅ FIX: Reemplazo de 'any' por Interface explícita FullRegisterDTO
    static validateFullRegister(data: FullRegisterDTO): { isValid: boolean; error?: string } {
        const guestValidation = this.validateGuest(data);
        if (!guestValidation.isValid) return guestValidation;

        if (!data.token || data.token.length < 20) {
            return {
                isValid: false,
                error: 'Se requiere un token de autenticación de Firebase válido.',
            };
        }

        return { isValid: true };
    }

    // --- 🟡 VALIDADORES DE ACTUALIZACIÓN ---

    // ✅ FIX: Usamos el tipo Partial<Usuario> en lugar de 'any'
    static validateProfileUpdate(data: Partial<Usuario>): { isValid: boolean; error?: string } {
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (data.rut && !this.isValidRut(data.rut)) {
            return { isValid: false, error: 'El nuevo RUT ingresado no es válido.' };
        }
        if (data.nombre && (data.nombre.trim().length < 2 || !nameRegex.test(data.nombre))) {
            return { isValid: false, error: 'El nombre contiene caracteres inválidos.' };
        }
        if (data.apellido && (data.apellido.trim().length < 2 || !nameRegex.test(data.apellido))) {
            return { isValid: false, error: 'El apellido contiene caracteres inválidos.' };
        }
        if (data.telefono) {
            const cleanPhone = data.telefono.replace(/\s/g, '').replace('+56', '');
            if (!/^[0-9]{9}$/.test(cleanPhone)) {
                return { isValid: false, error: 'Formato de teléfono inválido.' };
            }
        }

        return { isValid: true };
    }

    // --- 🔴 VALIDADORES ADMINISTRATIVOS ---

    // ✅ FIX: Uso de Record para tipado dinámico genérico en lugar de any
    static validateRoleChange(data: Record<string, unknown>): { isValid: boolean; error?: string } {
        if (!data.rol || !Object.values(UserRole).includes(data.rol as UserRole)) {
            return { isValid: false, error: 'El rol proporcionado no es válido en el sistema.' };
        }
        return { isValid: true };
    }

    static validateStatusChange(data: Record<string, unknown>): {
        isValid: boolean;
        error?: string;
    } {
        if (!data.estado || !Object.values(UserStatus).includes(data.estado as UserStatus)) {
            return { isValid: false, error: 'El estado proporcionado no es válido.' };
        }
        return { isValid: true };
    }
}
