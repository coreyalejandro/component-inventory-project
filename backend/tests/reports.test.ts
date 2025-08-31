import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from './helpers'
import { registerReportRoutes } from '../src/routes/reports.js'

describe('Report routes', () => {
  let app: any, pool: any
  beforeAll(async () => {
    ({ app, pool } = await buildTestApp())
    await registerReportRoutes(app)
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
    await pool.end()
  })

  it('GET /v1/reports/:id not implemented', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/reports/1' })
    expect(res.statusCode).toBe(501)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ error: 'report storage not implemented yet' })
  })
})
