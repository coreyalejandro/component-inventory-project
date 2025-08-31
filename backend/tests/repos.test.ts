
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import swaggerPlugin from '../src/plugins/swagger.js'
import { registerRepoRoutes } from '../src/routes/repos.js'

describe('Repo routes', () => {
  const app = Fastify()
  beforeAll(async () => {
    await app.register(swaggerPlugin)
    app.decorate('verifyServiceJwt', async (_req:any,_rep:any)=>{})
    app.decorate('scanQueue', { add: async ()=>({ id: 123 }) } as any)
    app.decorate('db', { query: async ()=>({ rows: [], rowCount: 0 }) } as any)
    await registerRepoRoutes(app)
    await app.ready()
  })
  afterAll(async () => { await app.close() })

  it('enqueues scan', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/repos/scan', payload: { owner: 'o', repo: 'r', token: 'ghp_abc123' } })
    expect(res.statusCode).toBe(202)
    const body = res.json()
    expect(body.scanId).toBe(123)
  })
})
