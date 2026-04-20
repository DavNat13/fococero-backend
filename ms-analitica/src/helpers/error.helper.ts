export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Token inválido o ausente.") {
    super(message, 401, "ERR_UNAUTHORIZED");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "ERR_VALIDATION");
  }
}
