
import { Redis } from 'ioredis'
import type { AppConfig } from './config.js'

export function makeRedis(cfg: AppConfig) {
  return new Redis(cfg.REDIS_URL)
}
