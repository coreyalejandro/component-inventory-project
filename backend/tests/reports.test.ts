
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import swaggerPlugin from '../src/plugins/swagger.js'
import { registerReportRoutes } from '../src/routes/reports.js'

describe('Report routes', () => {
  const app = Fastify()
  beforeAll(async () => {
    await app.register(swaggerPlugin)
    app.decorate('db', { query: async () => ({ rows: [], rowCount: 0 }) } as any)
    await registerReportRoutes(app)
    await app.ready()
  })
  afterAll(async () => { await app.close() })

  it('validates id', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/reports/abc' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when not found', async () => {
    app.db.query = async () => ({ rows: [], rowCount: 0 }) as any
    const res = await app.inject({ method: 'GET', url: '/v1/reports/1' })
    expect(res.statusCode).toBe(404)
  })

  it('returns report payload', async () => {
    app.db.query = async () => ({ rows: [{ payload: { ok: true } }], rowCount: 1 }) as any
    const res = await app.inject({ method: 'GET', url: '/v1/reports/1' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ ok: true })
  })
})

