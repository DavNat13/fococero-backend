// src/helpers/appError.ts

/**
 * Clase AppError: Estandariza las excepciones de la lógica de negocio.
 * Garantiza que cualquier error arrojado tenga un código HTTP predecible
 * para que el error.middleware lo procese sin necesidad de casteos inseguros.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Diferencia errores de negocio de bugs de programación

        // Mantiene la traza de la pila limpia (V8 Engine)
        Error.captureStackTrace(this, this.constructor);
    }
}
