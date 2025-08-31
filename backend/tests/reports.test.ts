import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import swaggerPlugin from '../src/plugins/swagger.js'
import { registerReportRoutes } from '../src/routes/reports.js'

describe('Report routes', () => {
  const app = Fastify()
  
// Mock database connection for testing
const db = {
  async query(_sql: string, params: any[]) {
    const id = params[0];
    if (id === 2) {
      return { rowCount: 1, rows: [{ id: 2, payload: { ok: true } }] };
    }
    return { rowCount: 0, rows: [] };
  }
};

beforeAll(async () => {
  await app.register(swaggerPlugin);
  app.decorate('db', db as any); // Use the mocked database for tests
  await registerReportRoutes(app);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

it('validates numeric id', async () => {
  // Add test implementation here
});
    const res = await app.inject({ method: 'GET', url: '/v1/reports/abc' })
    expect(res.statusCode).toBe(400)
  })

it('returns 404 when report not found', async () => {
  app.db.query = async () => ({ rows: [], rowCount: 0 }) as any;
  
  // Implement the test logic here, e.g., asserting the response when the report is not found
  const response = await app.inject({ method: 'GET', url: '/reports/2' }); // Adjust URL as necessary
  expect(response.statusCode).toBe(404);
});
    const res = await app.inject({ method: 'GET', url: '/v1/reports/1' })
    expect(res.statusCode).toBe(404)
  })

it('returns report payload when found', async () => {
  app.db.query = async () => ({ rows: [{ payload: { ok: true } }], rowCount: 1 }) as any;

  const res = await app.inject({ method: 'GET', url: '/v1/reports/2' }); // Adjust the URL if necessary to align with your test case
  expect(res.statusCode).toBe(200);

  const body = res.json();
  expect(body.ok).toBe(true);
});
