// tests/auth.test.ts

// Mock firebase-admin BEFORE any imports
jest.mock('firebase-admin');

import request from 'supertest';
import app from '../src/app';

describe('API Gateway - Auth Middleware', () => {
  it('should reject request without token on protected routes', async () => {
    const res = await request(app).get('/api/emergencias');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should reject request with invalid token on protected routes', async () => {
    const res = await request(app)
      .get('/api/emergencias')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should reject request without token on analitica route', async () => {
    const res = await request(app).get('/api/analitica/dashboard');
    expect(res.status).toBe(401);
  });

  it('should reject request with malformed auth header', async () => {
    const res = await request(app)
      .get('/api/emergencias')
      .set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
  });

  it('should reject request with empty token', async () => {
    const res = await request(app)
      .get('/api/emergencias')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('should allow public routes without authentication', async () => {
    const res = await request(app).get('/api/auth/health');
    // /api/auth does NOT have verifyToken middleware - it should try to proxy
    // Since the target is unreachable, it returns 502, not 401
    expect(res.status).toBe(502);
    expect(res.status).not.toBe(401);
  });
});
