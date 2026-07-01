/**
 * Configuración global para las pruebas de ms-auth
 */

// Silenciar logs durante pruebas
jest.mock('../src/config/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));
