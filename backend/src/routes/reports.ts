
import type { FastifyInstance } from 'fastify'

export async function registerReportRoutes(app: FastifyInstance) {
  app.get('/v1/reports/:id', {
    schema: {
      summary: 'Fetch a stored report by ID',
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id']
      },
      response: {
        200: { type: 'object', additionalProperties: true },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const id = Number((req.params as any).id)
    if (!Number.isInteger(id)) {
      return reply.code(400).send({ error: 'id must be numeric' })
    }
    const r = await app.db.query('SELECT payload FROM reports WHERE id=$1', [id])
    if (r.rowCount === 0) {
      return reply.code(404).send({ error: 'not found' })
    }
    return r.rows[0].payload
  })
}
