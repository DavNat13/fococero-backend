/**
 * Pruebas unitarias para AppError
 *
 * @module appError
 */

import { describe, it, expect } from '@jest/globals';
import { AppError } from '../src/helpers/appError';

describe('AppError - Error operacional personalizado', () => {
  it('✅ debería crear un error con mensaje y código de estado', () => {
    const error = new AppError('Recurso no encontrado', 404);
    expect(error.message).toBe('Recurso no encontrado');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it('✅ debería ser instancia de Error', () => {
    const error = new AppError('Error interno', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('✅ debería tener stack trace', () => {
    const error = new AppError('Error de prueba', 400);
    expect(error.stack).toBeDefined();
  });

  it('✅ debería manejar diferentes códigos de estado', () => {
    const error401 = new AppError('No autorizado', 401);
    expect(error401.statusCode).toBe(401);

    const error403 = new AppError('Prohibido', 403);
    expect(error403.statusCode).toBe(403);

    const error409 = new AppError('Conflicto', 409);
    expect(error409.statusCode).toBe(409);
  });
});
