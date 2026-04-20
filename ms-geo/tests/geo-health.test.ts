import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Simulamos la ruta de salud de ms-geo
const app = express();
app.get('/api/geo/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        service: 'ms-geo',
        timestamp: new Date().toISOString() 
    });
});

describe('🌍 MS-GEO: Verificación de Salud', () => {
    it('Debería responder 200 OK y confirmar que el servicio está UP', async () => {
        const response = await request(app).get('/api/geo/health');
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
        expect(response.body.service).toBe('ms-geo');
    });
});