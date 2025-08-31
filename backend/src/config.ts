
import 'dotenv/config'
import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_OAUTH_CALLBACK_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z.string().default('info')
})

export type AppConfig = z.infer<typeof EnvSchema>

export function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid configuration:', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  return parsed.data
}
