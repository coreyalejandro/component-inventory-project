import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from './helpers'
import { registerScanRoutes } from '../src/routes/scans.js'

describe('Scan routes', () => {
  let app: any, pool: any, scanId: number
  beforeAll(async () => {
    ({ app, pool } = await buildTestApp())
    await registerScanRoutes(app)
    await app.ready()
    const repo = await pool.query("INSERT INTO repositories (owner, name, default_branch, visibility) VALUES ('o','r','main','public') RETURNING id")
    const repoId = repo.rows[0].id
    const scan = await pool.query("INSERT INTO scans (repository_id, status, git_ref) VALUES ($1,'succeeded','main') RETURNING id", [repoId])
    scanId = scan.rows[0].id
  })
  afterAll(async () => {
    await app.close()
    await pool.end()
  })

  it('returns scan when found', async () => {
    const res = await app.inject({ method: 'GET', url: `/v1/scans/${scanId}` })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    const body = res.json()
    expect(body.id).toBe(scanId)
    expect(body.status).toBe('succeeded')
  })

  it('returns 404 when missing', async () => {
    const res = await app.inject({ method: 'GET', url: `/v1/scans/${scanId + 1}` })
    expect(res.statusCode).toBe(404)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.json()).toEqual({ error: 'not found' })
  })
})
