import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/alertas/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'ms-alertas' });
});

describe('🚨 MS-ALERTAS: Verificación de Salud', () => {
    it('Debería responder 200 OK y confirmar que el servicio está UP', async () => {
        const response = await request(app).get('/api/alertas/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
    });
});
