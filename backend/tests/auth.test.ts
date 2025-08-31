import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from './helpers'

describe('verifyServiceJwt middleware', () => {
  let app: any, pool: any, token: string
  beforeAll(async () => {
    ({ app, pool } = await buildTestApp({ withAuth: true }))
    app.get('/private', { preHandler: app.verifyServiceJwt as any }, async () => ({ ok: true }))
    await app.ready()
    token = app.auth.signServiceJwt({ sub: 'svc' })
  })
  afterAll(async () => {
    await app.close()
    await pool.end()
  })

  it('rejects missing token', async () => {
    const res = await app.inject({ method: 'GET', url: '/private' })
    expect(res.statusCode).toBe(401)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('accepts valid token', async () => {
    const res = await app.inject({ method: 'GET', url: '/private', headers: { authorization: `Bearer ${token}` } })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ ok: true })
  })
})
