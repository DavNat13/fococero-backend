/**
 * AppError: Clase personalizada para la gestión de excepciones operacionales.
 * Extiende la clase Error nativa de Node.js para incluir códigos de estado HTTP
 * y banderas de control para el middleware de errores.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    /**
     * @param message Mensaje descriptivo del error (será enviado al cliente).
     * @param statusCode Código de estado HTTP (400, 401, 403, 404, etc.).
     */
    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        // isOperational indica que es un error previsto por nuestra lógica (ej. validación fallida),
        // no un fallo de programación inesperado (ej. undefined is not a function).
        this.isOperational = true;

        // Capturamos el stack trace para facilitar la depuración sin incluir el constructor
        Error.captureStackTrace(this, this.constructor);
    }
}
