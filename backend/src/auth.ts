
import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyOauth2 from '@fastify/oauth2'
import { Octokit } from 'octokit'
import type { FastifyInstance } from 'fastify'
import type { AppConfig } from './config.js'

declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      signServiceJwt(payload: object): string
    }
  }
  interface FastifyRequest {
    user?: { sub: string, token?: string, role?: 'admin' | 'user' | 'read-only' }
  }
}

export default fp(async function authPlugin(app: FastifyInstance, opts: { cfg: AppConfig }) {
  const { cfg } = opts

  app.register(fastifyJwt, { secret: cfg.JWT_SECRET })

  app.decorate('auth', {
    signServiceJwt(payload: object) {
      return app.jwt.sign(payload, { expiresIn: '1h' })
    }
  })

  app.decorate('verifyServiceJwt', async (req, reply) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.register(fastifyOauth2, {
    name: 'githubOAuth2',
    scope: ['read:user', 'repo'],
    credentials: {
      client: {
        id: cfg.GITHUB_CLIENT_ID,
        secret: cfg.GITHUB_CLIENT_SECRET
      },
      auth: fastifyOauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/oauth/github/login',
    callbackUri: cfg.GITHUB_OAUTH_CALLBACK_URL
  })

  app.get('/oauth/github/callback', async function (req, reply) {
    const token = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
    const octokit = new Octokit({ auth: token.token.access_token })
    const { data: ghUser } = await octokit.rest.users.getAuthenticated()
    const sub = String(ghUser.id ?? ghUser.login)
    // In production: store token securely (KMS). Here we only return a session JWT with a token ref.
    const jwt = app.jwt.sign({ sub, provider: 'github', scope: 'repo', token: token.token.access_token }, { expiresIn: '2h' })
    reply.header('content-type', 'text/html')
    return reply.send(`<html><body><h1>GitHub Auth Complete</h1><p>Use this JWT for API calls:</p><pre>${jwt}</pre></body></html>`)
  })
})
