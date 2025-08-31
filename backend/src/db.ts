
import { Pool } from 'pg'
import type { AppConfig } from './config.js'
import { logger } from './logger.js'

export function makePool(cfg: AppConfig) {
  const pool = new Pool({ connectionString: cfg.DATABASE_URL })
  pool.on('error', (err) => logger.error({ err }, 'pg pool error'))
  return pool
}
