// tests/proxy.test.ts
import request from 'supertest';
import app from '../src/app';

describe('API Gateway - Proxy', () => {
  it('should return 502 for unreachable proxied service on /api/auth', async () => {
    // /api/auth does not require verifyToken, so the proxy will attempt
    // to connect to AUTH_SERVICE_URL (localhost:3001) and fail with 502
    const res = await request(app).get('/api/auth/test');
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    // Routes that don't match any proxy or route fall through to Express 404
    expect(res.status).toBe(404);
  });
});
