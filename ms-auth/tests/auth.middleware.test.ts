/**
 * Pruebas unitarias para el middleware de autenticación (validateFirebaseToken)
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Usamos jest.fn() sin tipado estricto para evitar errores TS con jest 30
const mockVerifyIdToken: any = jest.fn();
const mockFindByFirebaseUid: any = jest.fn();

jest.mock('../src/config/firebase', () => ({
    __esModule: true,
    default: {
        auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    },
}));

jest.mock('../src/repositories/user.repository', () => ({
    UserRepository: { findByFirebaseUid: mockFindByFirebaseUid },
}));

import { validateFirebaseToken } from '../src/middlewares/auth.middleware';
import { UserStatus, UserRole } from '../src/models/user.enum';

describe('validateFirebaseToken', () => {
    let req: any, res: any, next: any, jsonMock: any, statusMock: any;

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        req = { headers: {} };
        res = { status: statusMock };
        next = jest.fn();
    });

    it('debería rechazar petición sin header Authorization', async () => {
        await validateFirebaseToken(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('debería rechazar petición con header malformado', async () => {
        req.headers.authorization = 'Token invalid';
        await validateFirebaseToken(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('debería rechazar token inválido de Firebase', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        mockVerifyIdToken.mockRejectedValue(new Error('Token inválido'));
        await validateFirebaseToken(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('debería rechazar usuario no encontrado en DB con 403', async () => {
        req.headers.authorization = 'Bearer valid-token';
        mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-uid-123' });
        mockFindByFirebaseUid.mockResolvedValue(null);
        await validateFirebaseToken(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('debería rechazar usuario bloqueado con 403', async () => {
        req.headers.authorization = 'Bearer valid-token';
        mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-uid-123' });
        mockFindByFirebaseUid.mockResolvedValue({
            id: 1,
            estado: UserStatus.BLOQUEADO,
            firebase_uid: 'firebase-uid-123',
        });
        await validateFirebaseToken(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('debería permitir usuario activo y autenticado', async () => {
        const mockUser = {
            id: 1,
            rut: '12345678-5',
            nombre: 'Juan',
            estado: UserStatus.ACTIVO,
            rol: UserRole.USUARIO,
            firebase_uid: 'firebase-uid-123',
        };
        req.headers.authorization = 'Bearer valid-token';
        mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-uid-123' });
        mockFindByFirebaseUid.mockResolvedValue(mockUser);
        await validateFirebaseToken(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(mockUser);
        expect(statusMock).not.toHaveBeenCalled();
    });
});
