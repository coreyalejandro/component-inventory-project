import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import swaggerPlugin from '../src/plugins/swagger.js'
import { registerReportRoutes } from '../src/routes/reports.js'

describe('Report routes', () => {
  const app = Fastify()
  const db = {
    async query(_sql: string, params: any[]) {
      const id = params[0]
      if (id === 2) {
        return { rowCount: 1, rows: [{ id: 2, payload: { ok: true } }] }
      }
      return { rowCount: 0, rows: [] }
    }
  }

  beforeAll(async () => {
    await app.register(swaggerPlugin)
    app.decorate('db', db as any)
    await registerReportRoutes(app)
    await app.ready()
  })

  afterAll(async () => { await app.close() })

  it('validates numeric id', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/reports/abc' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when report not found', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/reports/1' })
    expect(res.statusCode).toBe(404)
  })

  it('returns report payload when found', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/reports/2' })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.ok).toBe(true)
  })
})
