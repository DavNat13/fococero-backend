import { describe, it, expect } from '@jest/globals'; // <- Esta línea elimina los errores de VS Code
import request from 'supertest';
import express from 'express';

// Simulamos una mini-app para probar
const app = express();
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

describe('Verificación de Salud del Sistema (Health Check)', () => {
    it('Debería responder con código 200 y status UP', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP' });
    });
});
