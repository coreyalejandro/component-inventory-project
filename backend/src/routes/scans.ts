
import type { FastifyInstance } from 'fastify'

export async function registerScanRoutes(app: FastifyInstance) {
  app.get('/v1/scans/:id', async (req, reply) => {
    const id = Number((req.params as any).id)
    const r = await app.db.query('SELECT id, repository_id, started_at, finished_at, status, summary FROM scans WHERE id=$1', [id])
    if (r.rowCount === 0) return reply.code(404).send({ error: 'not found' })
    return r.rows[0]
  })
}
