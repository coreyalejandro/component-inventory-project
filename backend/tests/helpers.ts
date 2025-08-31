import Fastify from 'fastify'
import { newDb } from 'pg-mem'
import authPlugin from '../src/auth.js'
import { readFileSync } from 'fs'

export async function buildTestApp(opts: { withAuth?: boolean } = {}) {
  const db = newDb()
  const sql = readFileSync(new URL('../migrations/001_init.sql', import.meta.url), 'utf8')
  db.public.none(sql)
  const pg = db.adapters.createPg()
  const pool = new pg.Pool()
  const app = Fastify()
  app.decorate('db', { query: (text: string, params?: any[]) => pool.query(text, params) } as any)
  if (opts.withAuth) {
    const cfg = {
      JWT_SECRET: 'test-secret',
      GITHUB_CLIENT_ID: 'id',
      GITHUB_CLIENT_SECRET: 'secret',
      GITHUB_OAUTH_CALLBACK_URL: 'http://localhost/callback'
    } as any
    await app.register(authPlugin, { cfg })
  }
  return { app, pool }
}
