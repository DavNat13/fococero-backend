// ms-reportes/tests/smoke.test.ts

describe('Smoke Test - ms-reportes', () => {
    it('debería confirmar que el entorno de pruebas está configurado', () => {
        const proyecto = 'FocoCero';
        expect(proyecto).toBe('FocoCero');
    });

    it('debería tener acceso a las variables de entorno básicas', () => {
        // Verifica que Jest pueda cargar el entorno de Node
        expect(process.env.NODE_ENV).toBeDefined();
    });
});
