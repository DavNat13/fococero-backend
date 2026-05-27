// tests/health.test.ts
import request from 'supertest';
import app from '../src/app';

describe('API Gateway - Health', () => {
  it('GET /health should return 200 with status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'FocoCero-Gateway');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/docs/ should return 200 for swagger docs', async () => {
    // swagger-ui-express redirects /api/docs -> /api/docs/ (301)
    // Using trailing slash avoids the redirect
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger');
  });
});
