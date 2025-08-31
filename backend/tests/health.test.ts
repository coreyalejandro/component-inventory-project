import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { registerHealthRoutes } from '../src/routes/health.js'
import { buildTestApp } from './helpers'

describe('Health routes', () => {
  let app: any, pool: any
  beforeAll(async () => {
    ({ app, pool } = await buildTestApp())
    await registerHealthRoutes(app)
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
    await pool.end()
  })

  it('GET /healthz', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ status: 'ok' })
  })

  it('GET /readyz', async () => {
    const res = await app.inject({ method: 'GET', url: '/readyz' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ ready: true })
  })
})
