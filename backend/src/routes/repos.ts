
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { defaultJobOpts } from '../queue.js'

export async function registerRepoRoutes(app: FastifyInstance) {
  const EnqueueBody = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    gitRef: z.string().min(1).default('main'),
    token: z.string().min(10).optional()
  })

  app.post('/v1/repos/scan', {
    preHandler: app.verifyServiceJwt as any,
    schema: {
      summary: 'Enqueue a repository scan',
      body: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, gitRef: { type: 'string' }, token: { type: 'string' } }, required: ['owner','repo'] },
      response: { 202: { type: 'object', properties: { scanId: { type: 'number' } } } }
    }
  }, async (req, reply) => {
    const body = EnqueueBody.parse(req.body)
    const token = body.token || (req.user as any)?.token || ''
    if (!token) return reply.code(400).send({ error: 'GitHub token required (body.token or user token)' })
    const job = await app.scanQueue.add('scan', { owner: body.owner, repo: body.repo, gitRef: body.gitRef, token }, defaultJobOpts)
    return reply.code(202).send({ scanId: job.id })
  })

  app.get('/v1/repos/:owner/:repo/inventory', {
    schema: {
      summary: 'Get latest inventory summary for a repository',
      params: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } }, required: ['owner','repo'] }
    }
  }, async (req, reply) => {
    const { owner, repo } = req.params as any
    const r = await app.db.query(`
      SELECT s.id, s.summary, s.status, s.started_at, s.finished_at
      FROM scans s
      JOIN repositories r ON r.id = s.repository_id
      WHERE r.owner=$1 AND r.name=$2
      ORDER BY s.started_at DESC
      LIMIT 1
    `, [owner, repo])
    if (r.rowCount === 0) return reply.code(404).send({ error: 'No scans found' })
    return { scan: r.rows[0] }
  })
}
