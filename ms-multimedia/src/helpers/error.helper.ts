// ms-multimedia/src/helpers/error.helper.ts

/**
 * Clase personalizada para manejar errores operativos de la API.
 * Permite adjuntar un código de estado HTTP (ej. 404, 400) al error
 * para que el errorHandler sepa exactamente cómo responder.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational; 

        Error.captureStackTrace(this, this.constructor);
    }
}
