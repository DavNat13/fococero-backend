/**
 * Pruebas unitarias para el middleware de roles (authorizeRole)
 *
 * @module role.middleware
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { authorizeRole } from '../src/middlewares/role.middleware';
import { UserRole } from '../src/models/user.enum';

describe('authorizeRole - Middleware de autorización por roles', () => {
    let req: any;
    let res: any;
    let next: any;
    let jsonMock: any;
    let statusMock: any;

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {};
        res = { status: statusMock };
        next = jest.fn();
    });

    it('✅ debería rechazar si req.user no existe', () => {
        const middleware = authorizeRole([UserRole.ADMIN]);
        middleware(req, res, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        expect(next).not.toHaveBeenCalled();
    });

    it('✅ debería rechazar si el rol del usuario no está permitido', () => {
        req.user = { id: 1, rol: UserRole.USUARIO };
        const middleware = authorizeRole([UserRole.ADMIN]);
        middleware(req, res, next);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        expect(next).not.toHaveBeenCalled();
    });

    it('✅ debería permitir si el rol está en la lista de permitidos', () => {
        req.user = { id: 1, rol: UserRole.ADMIN };
        const middleware = authorizeRole([UserRole.ADMIN]);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('✅ debería permitir múltiples roles válidos', () => {
        req.user = { id: 1, rol: UserRole.BRIGADISTA };
        const middleware = authorizeRole([UserRole.ADMIN, UserRole.BRIGADISTA]);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
