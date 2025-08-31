
import type { FastifyInstance } from 'fastify'

export async function registerReportRoutes(app: FastifyInstance) {
  // Placeholder logical route to fetch stored signed reports (future storage layer).
  app.get('/v1/reports/:id', async (req, reply) => {
    return reply.code(501).send({ error: 'report storage not implemented yet' })
  })
}
