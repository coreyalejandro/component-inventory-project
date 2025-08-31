import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import Fastify from 'fastify'
import swaggerPlugin from '../src/plugins/swagger.js'

// Mock implementation of Octokit
vi.mock('octokit', () => {
  class MockOctokit {
    auth: string
    rest: { users: { getAuthenticated: () => Promise<{ data: { id: number, login: string } }> } }

    constructor(opts: any) {
      this.auth = opts.auth
      this.rest = {
        users: {
          getAuthenticated: this.getAuthenticated.bind(this)
        }
      }
    }

    async getAuthenticated() {
      if (this.auth === 'token1') {
        return { data: { id: 1, login: 'user1' } }
      }
      return { data: { id: 2, login: 'user2' } }
    }
  }

  return { Octokit: MockOctokit }
})

// Import the auth plugin
const authPlugin = (await import('../src/auth.js')).default

function extractJwt(html: string): string {
  const m = html.match(/<pre>([^<]+)<\/pre>/)
  return m ? m[1] : ''
}

describe('GitHub auth sub claim', () => {
  const cfg = {
    NODE_ENV: 'test',
    PORT: 3000,
    BASE_URL: 'http://localhost:3000',
    JWT_SECRET: 'test-secret',
    GITHUB_CLIENT_ID: 'id',
    GITHUB_CLIENT_SECRET: 'secret',
    GITHUB_OAUTH_CALLBACK_URL: 'http://localhost/oauth/github/callback',
    DATABASE_URL: 'http://localhost/db',
    REDIS_URL: 'http://localhost/redis',
    LOG_LEVEL: 'info'
  }

  const app = Fastify()

  beforeAll(async () => {
    await app.register(swaggerPlugin)
    await app.register(authPlugin, { cfg })
    await app.ready()
  })

  afterAll(async () => { await app.close() })

  it('assigns distinct sub claims per GitHub user', async () => {
    app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow = async () => ({ token: { access_token: 'token1' } })
    const res1 = await app.inject({ method: 'GET', url: '/oauth/github/callback?code=a' })
    const payload1 = app.jwt.decode(extractJwt(res1.body)) as any

    app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow = async () => ({ token: { access_token: 'token2' } })
    const res2 = await app.inject({ method: 'GET', url: '/oauth/github/callback?code=b' })
    const payload2 = app.jwt.decode(extractJwt(res2.body)) as any

    expect(payload1.sub).toBeDefined()
    expect(payload2.sub).toBeDefined()
    expect(payload1.sub).not.toBe(payload2.sub)
  })
})
  })
})
