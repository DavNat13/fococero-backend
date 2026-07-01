/**
 * Pruebas unitarias para el middleware de manejo de errores global
 *
 * @module error.middleware
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { errorHandler } from '../src/middlewares/error.middleware';
import { AppError } from '../src/helpers/appError';

describe('errorHandler - Middleware global de errores', () => {
    let req: any;
    let res: any;
    let next: any;
    let jsonMock: any;
    let statusMock: any;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = { headers: {} };
        res = { status: statusMock };
        next = jest.fn();
    });

    it('✅ debería manejar AppError con código de estado personalizado', () => {
        const appError = new AppError('Recurso no encontrado', 404);
        errorHandler(appError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: 'Recurso no encontrado',
        });
    });

    it('✅ debería manejar AppError con código 400', () => {
        const appError = new AppError('Datos inválidos', 400);
        errorHandler(appError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: 'Datos inválidos',
        });
    });

    it('✅ debería retornar 500 para errores no operacionales', () => {
        const systemError = new Error('Error interno del sistema');
        errorHandler(systemError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: 'Error interno del servidor. Contacte al equipo de FocoCero.',
        });
    });

    it('✅ debería retornar 500 para error de Firebase no-AppError', () => {
        // El handler solo traduce códigos auth/ para instancias de AppError
        const firebaseError = new Error('Firebase error') as any;
        firebaseError.code = 'auth/id-token-expired';

        errorHandler(firebaseError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(500);
    });

    it('✅ debería traducir código auth/ en AppError a 401', () => {
        const appError = new AppError('Token expirado', 401) as any;
        appError.code = 'auth/id-token-expired';

        errorHandler(appError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: expect.stringContaining('sesión ha expirado'),
        });
    });

    it('✅ debería traducir auth/invalid-id-token en AppError a 401', () => {
        const appError = new AppError('Token inválido', 401) as any;
        appError.code = 'auth/invalid-id-token';

        errorHandler(appError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: expect.stringContaining('corrupto'),
        });
    });

    it('✅ debería retornar 500 para errores sin statusCode', () => {
        const unknownError = { message: 'Algo salió mal' };
        errorHandler(unknownError, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(500);
    });

    it('✅ debería manejar error con statusCode 409 personalizado', () => {
        const error409 = new AppError('Conflicto de datos', 409);
        errorHandler(error409, req, res, next);

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({
            ok: false,
            error: 'Conflicto de datos',
        });
    });
});
