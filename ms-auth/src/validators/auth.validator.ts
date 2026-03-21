import { RutHelper } from '../helpers/rut.helper';

export class AuthValidator {

    /**
     * Valida el formato y el dígito verificador de un RUT chileno
     */
    private static isValidRut(rut: string): boolean {
        const cleanRut = RutHelper.clean(rut);
        if (cleanRut.length < 8) return false;

        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toUpperCase();

        let suma = 0;
        let multiplo = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            suma += parseInt(body[i]) * multiplo;
            multiplo = (multiplo === 7) ? 2 : multiplo + 1;
        }

        const dvEsperado = 11 - (suma % 11);
        let dvReal = '';
        if (dvEsperado === 11) dvReal = '0';
        else if (dvEsperado === 10) dvReal = 'K';
        else dvReal = dvEsperado.toString();

        return dv === dvReal;
    }

    static validateGuest(data: any): { isValid: boolean; error?: string } {
        const { rut, nombre, apellido, telefono } = data;

        // Validación de RUT Real
        if (!rut || !this.isValidRut(rut)) {
            return { isValid: false, error: 'El RUT ingresado no es válido o tiene un formato incorrecto' };
        }

        // Validación de Nombre y Apellido (Solo letras y espacios)
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nombre || nombre.trim().length < 2 || !nameRegex.test(nombre)) {
            return { isValid: false, error: 'El nombre debe tener al menos 2 letras y no contener números' };
        }
        if (!apellido || apellido.trim().length < 2 || !nameRegex.test(apellido)) {
            return { isValid: false, error: 'El apellido debe tener al menos 2 letras y no contener números' };
        }

        // Validación de Teléfono (Formato chileno simple: 9 dígitos)
        const phoneRegex = /^[0-9]{9}$/;
        const cleanPhone = telefono?.replace(/\s/g, '').replace('+56', '');
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
            return { isValid: false, error: 'El teléfono debe ser un número de 9 dígitos (ej: 912345678)' };
        }

        return { isValid: true };
    }

    static validateFullRegister(data: any): { isValid: boolean; error?: string } {
        // Reutilizamos la validación de invitado
        const guestValidation = this.validateGuest(data);
        if (!guestValidation.isValid) return guestValidation;

        // Firebase Token es obligatorio para el registro full
        if (!data.token || data.token.length < 20) {
            return { isValid: false, error: 'Se requiere un token de autenticación de Firebase válido' };
        }
        
        return { isValid: true };
    }
}