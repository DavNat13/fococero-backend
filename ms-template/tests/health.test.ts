// tests/health.test.ts
import request from 'supertest';
import app from '../src/app';

describe('MS-Template - Health', () => {
  it('GET /health should return 200 with status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('service', 'ms-template');
  });

  it('GET /api/v1 should return API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'ms-template API');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  it('GET /nonexistent should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
