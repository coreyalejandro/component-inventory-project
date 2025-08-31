
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq'
import { makeRedis } from './redis.js'
import type { AppConfig } from './config.js'
import type { Pool } from 'pg'
import { runScan } from './services/scanner.js'

export type ScanJobData = { owner: string, repo: string, gitRef?: string, token: string }

export function makeScanQueue(cfg: AppConfig) {
  const connection = { url: cfg.REDIS_URL }
  const queue = new Queue<ScanJobData>('scan-queue', { connection })
  const events = new QueueEvents('scan-queue', { connection })
  return { queue, events }
}

export function startScanWorker(cfg: AppConfig, db: Pool) {
  const connection = { url: cfg.REDIS_URL }
  const worker = new Worker<ScanJobData>('scan-queue', async (job) => {
    const { owner, repo, gitRef = 'main', token } = job.data
    await runScan(db, token, { owner, name: repo }, gitRef)
  }, { connection, concurrency: 4 })
  return worker
}

export const defaultJobOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 1000,
  removeOnFail: 5000
}
