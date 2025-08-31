
import type { FastifyInstance } from 'fastify'

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/healthz', async () => ({ status: 'ok' }))
  app.get('/readyz', async () => ({ ready: true }))
}
