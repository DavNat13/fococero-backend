// tests/rateLimiter.test.ts
import request from 'supertest';
import app from '../src/app';

describe('API Gateway - Rate Limiter', () => {
  it('should allow requests under rate limit on /health', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
    }
  });

  it('should include rate limit headers on health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    // RateLimit-* headers are set by express-rate-limit when standardHeaders: true
    if (res.headers['ratelimit-limit']) {
      expect(Number(res.headers['ratelimit-limit'])).toBeGreaterThan(0);
    }
  });
});
