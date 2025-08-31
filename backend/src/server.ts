
import Fastify from 'fastify'
import { loadConfig } from './config.js'
import { makePool } from './db.js'
import { makeRedis } from './redis.js'
import swaggerPlugin from './plugins/swagger.js'
import authPlugin from './auth.js'
import { registerHealthRoutes } from './routes/health.js'
import { registerRepoRoutes } from './routes/repos.js'
import { registerScanRoutes } from './routes/scans.js'
import { registerReportRoutes } from './routes/reports.js'
import { makeScanQueue, startScanWorker } from './queue.js'

const cfg = loadConfig()
const app = Fastify({ 
  logger: { 
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
})

declare module 'fastify' {
  interface FastifyInstance {
    db: import('pg').Pool
    redis: import('ioredis').Redis
    scanQueue: import('bullmq').Queue
    verifyServiceJwt: any
  }
}

async function main() {
  // Plugins
  await app.register(swaggerPlugin)
  await app.register(authPlugin, { cfg })

  // Infra
  const db = makePool(cfg)
  app.decorate('db', db)
  const redis = makeRedis(cfg)
  app.decorate('redis', redis)

  // Queue
  const { queue } = makeScanQueue(cfg)
  app.decorate('scanQueue', queue)
  startScanWorker(cfg, db)

  // Routes
  await registerHealthRoutes(app)
  await registerRepoRoutes(app)
  await registerScanRoutes(app)
  await registerReportRoutes(app)

  await app.ready()
  await app.listen({ port: cfg.PORT, host: '0.0.0.0' })
  app.log.info(`Server started on :${cfg.PORT}`)
}

main().catch((err) => {
  app.log.error(err)
  process.exit(1)
})
