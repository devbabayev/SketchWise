import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, closeDatabase } from '../index.js';

afterAll(async () => {
  await closeDatabase();
});

describe('Admin Token API', () => {
  it('should return token status as false initially', async () => {
    const res = await request(app).get('/api/admin/token-status');
    expect(res.status).toBe(200);
    expect(res.body.hasToken).toBe(false);
  });

  it('should reject token update without correct admin password', async () => {
    const res = await request(app)
      .post('/api/admin/token')
      .send({ token: 'test-token', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should update token with correct admin password', async () => {
    // We assume the test environment uses a specific admin password
    process.env.ADMIN_PASSWORD = 'test_password';
    
    const res = await request(app)
      .post('/api/admin/token')
      .send({ token: 'new-ai-token', password: 'test_password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Check status again
    const statusRes = await request(app).get('/api/admin/token-status');
    expect(statusRes.body.hasToken).toBe(true);
  });
});

describe('Secure Paywall Architecture', () => {
  let projectId;

  it('analyze-files should return teaser payload and projectId but NOT full data', async () => {
    const res = await request(app)
      .post('/api/analyze-files')
      .field('test', 'data');
    
    expect(res.status).toBe(200);
    expect(res.body.projectId).toBeDefined();
    expect(res.body.teaser.original).toBeDefined();
    expect(res.body.teaser.optimized).toBeDefined();
    
    // Assert the full details are NOT leaked
    expect(res.body.fullResult).toBeUndefined();
    expect(res.body.materials).toBeUndefined();

    projectId = res.body.projectId;
  });

  it('purchase should return full data and 12-digit number', async () => {
    const res = await request(app)
      .post('/api/purchase')
      .send({ projectId, email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.userId).toMatch(/^\d{12}$/);
    expect(res.body.fullResult).toBeDefined();
    expect(res.body.fullResult.materials).toBeDefined();
  });
});
