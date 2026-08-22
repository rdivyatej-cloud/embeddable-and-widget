import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import { getGeoLocation } from '../src/services/geo';

jest.mock('../src/services/geo');

describe('Widget Platform API', () => {
  beforeAll(() => {
    // Clear and seed for tests
    db.exec('DELETE FROM submissions');
    db.exec('DELETE FROM widgets');
    db.exec('DELETE FROM users');

    db.prepare('INSERT INTO users (id, username, token) VALUES (?, ?, ?)').run(
      'test-user', 'test_user', 'test-token'
    );

    db.prepare('INSERT INTO widgets (id, owner_id, title, button_text, type) VALUES (?, ?, ?, ?, ?)').run(
      'test-widget', 'test-user', 'Test Title', 'Test Button', 'signup'
    );
  });

  afterAll(() => {
    // Cleanup if needed
  });

  it('PROBE 1 - POST a valid submission -> stored, 2xx', async () => {
    (getGeoLocation as jest.Mock).mockResolvedValue({ country: 'Test Country', city: 'Test City' });

    const res = await request(app)
      .post('/api/submissions')
      .send({ widget_id: 'test-widget', email: 'valid@example.com', name: 'Valid User' })
      .set('Origin', 'http://customer-site.com');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const submission = db.prepare('SELECT * FROM submissions WHERE widget_id = ?').get('test-widget') as any;
    expect(submission).toBeDefined();
    expect(submission.country).toBe('Test Country');
  });

  it('PROBE 2 - Send a malformed and oversized payload -> clean 4xx JSON errors', async () => {
    // Malformed
    const res1 = await request(app)
      .post('/api/submissions')
      .send({ widget_id: 'test-widget' }) // missing email
      .set('Origin', 'http://customer-site.com');
    expect(res1.status).toBe(400);
    expect(res1.body.error).toBeDefined();

    // Oversized (>10kb due to our limit in app.ts)
    const bigData = 'a'.repeat(20000);
    const res2 = await request(app)
      .post('/api/submissions')
      .send({ widget_id: 'test-widget', email: 'valid@example.com', name: bigData });
    expect(res2.status).toBe(413); // Payload Too Large from express.json limit
  });

  it('PROBE 3 - CORS preflight handles properly', async () => {
    const res = await request(app)
      .options('/api/submissions')
      .set('Origin', 'http://customer-site.com')
      .set('Access-Control-Request-Method', 'POST');
    
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('PROBE 4 - Disable geo provider -> fallback works, or degraded gracefully', async () => {
    // Both fail -> graceful degradation
    (getGeoLocation as jest.Mock).mockResolvedValue({ country: null, city: null });

    const res = await request(app)
      .post('/api/submissions')
      .send({ widget_id: 'test-widget', email: 'failgeo@example.com' });

    expect(res.status).toBe(201);
    
    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(res.body.id) as any;
    expect(submission.country).toBeNull();
  });

  it('PROBE 6 - Fill honeypot field -> silent drop/reject', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ widget_id: 'test-widget', email: 'bot@example.com', _honeypot: 'bot filled this' });

    // Returns success but does not store
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = db.prepare("SELECT * FROM submissions WHERE data LIKE '%bot@example.com%'").get();
    expect(check).toBeUndefined();
  });

  it('Dashboard API works', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer test-token');
    
    expect(res.status).toBe(200);
    expect(res.body.stats.length).toBeGreaterThan(0);
  });
});
