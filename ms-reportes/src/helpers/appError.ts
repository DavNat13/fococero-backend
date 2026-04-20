// src/helpers/appError.ts
export class AppError extends Error {
    public readonly statusCode: number;
    
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        // Mantiene la traza de la pila limpia (exclusivo de V8)
        Error.captureStackTrace(this, this.constructor);
    }
}